const fs = require("fs");
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();

// const mysql      = require('mysql');

const db = new sqlite3.Database(dbFile);


function formatNaira(num) {
    var p = num.toFixed(2).split(".");
    return (
      "N " +
      p[0]
        .split("")
        .reverse()
        .reduce(function(acc, num, i, orig) {
          return num == "-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
        }, "")
      // +
      // "." +
      // p[1]
    );
  }

module.exports = {
    sum: function(a, b) {
      return a + b;
    },
    get_oitems: async(oid) => {

        let query = "SELECT * from order_items where order_id='" + oid + "' AND quantity > 0";

        db.all(
            query,
            (err, rows) => {
              console.log("Row ln: " + rows.length);
              if(err){
                console.log("Oitem error: ", err);

                return {status: -1};
              } else {
 
                let total_p = 0;
                let elements = [];

                if (rows.length > 0) {

                    rows.forEach( row => {
                        var price = row.price;
                        var quantity = row.quantity;
                        var t_price = price * quantity;
                
                        total_p += t_price;
                        row.price = formatNaira(price);
                      
                        elements.push(row);
                    });
                    
                    total_p = formatNaira(total_p);
                    
                    return {status: 0, elements: elements, tp: total_p};
    
                } else {
                    
                    return {status: -1};

                }
            }
        });

    }

};