
// where your node app starts

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();


const moment = require("moment");
const tz = require("moment-timezone");

var path = require("path");


var sha512 = require("js-sha512");
var request = require("request");

var httpBuildQuery = require("http-build-query");

var compression = require("compression");
var helmet = require("helmet");

const url = require("url");
const requestPromise = require("request-promise");
const chatfuelBroadcast = require("chatfuel-broadcast").default;

var mailer = require("./my-mailer.js");
var m_security = require("./security.js");

const { fetch_loc } = require("./fetch.js");
const { get_oitems } = require("./dbhelper.js");

//Interswitch params
const mac = process.env.INTERSWITCH_KEY_DEMO;

const prodid = process.env.PRODID_DEMO;

const qurl = process.env.QURL_DEMO;

// const ps_key= process.env.PAYSTACK_KEY;
const ps_key= process.env.CHOP_PAYSTACK_KEY;

//Interswitch params end

const fs = require("fs");

app.use(compression()); //Compress all routes
app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

// app.engine("html", require("ejs").renderFile);
app.set('view engine', 'ejs');

const base_url = process.env.BASE_URLX;

// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
  if (!exists) {
//     db.run(
//       // "CREATE TABLE Dreams (id INTEGER PRIMARY KEY AUTOINCREMENT, dream TEXT)"

//       "CREATE TABLE userorders (" +
//         "`order_id` varchar(30) NOT NULL," +
//         "`fname` varchar(30) NOT NULL," +
//         "`lname` varchar(30) NOT NULL," +
//         "`email` varchar(50) DEFAULT NULL," +
//         "`address` text," +
//         "`delivery_district` varchar(30) DEFAULT NULL," +
//         "`total_price` decimal(10,2) DEFAULT NULL," +
//         "`takeaway` decimal(10,2) DEFAULT NULL," +
//         "`status` varchar(30) DEFAULT NULL," +
//         "`date` date NOT NULL," +
//         "PRIMARY KEY (`order_id`)" +
//         ")"
//     );
    
  } else {
    // db.run("Drop Table order_items");
    // db.run("Drop Table userorders");

    db.run(
      "CREATE TABLE IF NOT EXISTS m_cats (" +
        "cid INTEGER PRIMARY KEY AUTOINCREMENT," +
        "title varchar(50) NOT NULL," +
        "img_url varchar(100)," +
        "desc text," +
        "active INTEGER " +
        ")"
    );

    db.run(
      "CREATE TABLE IF NOT EXISTS m_items (" +
        "_id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "cid INTEGER," +
        "title varchar(50) NOT NULL," +
        "price decimal(10,2) DEFAULT NULL," +
        "takeaway decimal(10,2) DEFAULT NULL," +
        "img_url varchar(100)," +
        "desc text," +
        "active INTEGER ," +
        "FOREIGN KEY (cid) REFERENCES m_cats (cid) "+
        ")"
    );



    db.run(
      "CREATE TABLE IF NOT EXISTS userorders (" +
        "order_id varchar(30) NOT NULL," +
        "pay_ref varchar(30)," +
        "fname varchar(30) NOT NULL," +
        "lname varchar(30) NOT NULL," +
        "email varchar(50) DEFAULT NULL," +
        "phone varchar(15) DEFAULT NULL," +
        "address text," +
        "delivery_district varchar(30) DEFAULT NULL," +
        "total_price decimal(10,2) DEFAULT NULL," +
        "takeaway decimal(10,2) DEFAULT NULL," +
        "status varchar(30) DEFAULT NULL," +
        "time_slot varchar(30) DEFAULT NULL," +
        "chat_id varchar(30) DEFAULT NULL," +
        "order_info text," +
        "date date NOT NULL," +
        "PRIMARY KEY (order_id)" +
        ")"
    );
    console.log("New table User ORders created!");

    db.run(
      "CREATE TABLE IF NOT exists order_items (" +
        "oitem_id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "order_id varchar(30) NOT NULL," +
        "item_id int(11) NOT NULL," +
        "title varchar(30) NOT NULL," +
        "price decimal(10,2) NOT NULL," +
        "takeaway decimal(10,2) NOT NULL," +
        "img_url varchar(50) NOT NULL," +
        "meal_opt_lbl varchar(20) DEFAULT NULL," +
        "meal_opt varchar(20) DEFAULT NULL," +
        "side_option varchar(20) DEFAULT NULL," +
        "sauce_option varchar(20) DEFAULT NULL," +
        "quantity int(11) DEFAULT NULL," +
        "FOREIGN KEY (order_id) REFERENCES userorders (order_id)" +
        ")"
    );
    

    console.log('Database "User Orders" ready to go!');
    db.each("SELECT * from userorders", (err, row) => {
      if (row) {
        console.log(`record: ${row.order_id}`);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.send(JSON.stringify("a",base_url));
});

// endpoint to get all the dreams in the database
app.get("/mailling", (request, response) => {
  var params = {
    subject: "ChopNowNow Order Successful",
    cname: "Ore Faseru",
    cmail: "orefash@gmail.com",
    template: "customer"
  };
  mailer.send_mail(params);
  // console.log("Value: "+value);

  response.send(JSON.stringify("DOne"));
});

app.get("/receipt", (request, response) => {
  var oid = request.query.oid;
  // var oid = "20200118173554";

  var district = "";

  var address = "";
  var cname = "";
  var phone = "";
  var email = "";
  var total = "";

  var elements = [];

  db.serialize(() => {
    db.each(
      "SELECT * from userorders where order_id='" + oid + "'",
      (err, row) => {
        // console.log("row", row);
        address = row.address;
        cname = row.fname + " " + row.lname;
        phone = row.phone;
        email = row.email;
        total = row.total_price;
        district = row.delivery_district;
      }
    );

    db.all(
      "SELECT * from order_items where order_id='" + oid + "' AND quantity > 0",
      (err, rows) => {
        if (rows.length > 0) {
          rows.forEach(row => {
            var price = row.price;
            var img = row.img_url;
            var subtitle = "Quantity: " + row.quantity;
            var title = row.title;

            var object = {
              title: title,
              subtitle: subtitle,
              price: price,
              currency: "NGN",
              image_url: img
            };

            elements.push(object);
          });

          const timestamp = (new Date() / 1000) | 0;

          var message = {
            messages: [
              {
                attachment: {
                  type: "template",
                  payload: {
                    template_type: "receipt",
                    recipient_name: cname,
                    merchant_name: "ChopNowNow",
                    order_number: oid,
                    currency: "NGN",
                    payment_method: "Online Payment",
                    order_url:
                      "https://rockets.chatfuel.com/store?order_id=12345678901",
                    timestamp: timestamp,

                    address: {
                      street_1: address,
                      street_2: "",
                      city: ", " + district.split("+")[0].toLowerCase(),
                      postal_code: "0000",
                      state: "Lagos",
                      country: "Nigeria"
                    },
                    summary: {
                      total_cost: total
                    },
                    elements: elements
                  }
                }
              }
            ]
          };

          response.json(message);
        }
      }
    );
  });
});

app.post("/cgate-callback", function(req, res) {
  console.log("In cgate callback");
  console.log(req.body);
  
  
  res.send(JSON.stringify("Transaction status: ", req.body.responsemessage));
  
});

app.get("/kt", (request, response) => {
  
  m_security.encrypt("Hello world");
  
});

app.post("/confirm", function(req, res) {
  console.log("In post");
  console.log(req.body); // req data
  var xtxn = req.body.txnref; // txnref posted from webpay redirect
  var amount = req.body.amount; // amount posted from webpay redirect
  var parameters = {
    productid: prodid,
    transactionreference: xtxn,
    amount: amount
  };
  
  
  console.log("PARAMS: ",parameters); 

  var init_oid = req.query.oid;

  // parameter buider using http.build-query
  var params = httpBuildQuery(parameters);

  // computing hash value with product_id, transaction ref, mac key
  const hashv = prodid + xtxn + mac;
  var thash = sha512(hashv); // using js-sha512

  // http get request options
  const options = {
    Accept: "*/*",
    url: qurl + params,
    method: "GET",
    //  proxy: proxy,

    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.1) Gecko/2008070208 Firefox/3.0.1",
      "Accept-Language": "en-us,en;q=0.5",
      "Keep-Alive": "300",
      Connection: "keep-alive",
      Hash: thash
    }
  };

  request(options, function(err, result) {
    var rst = JSON.parse(result.body);
    var address = "";
    var cname = "";
    var phone = " ";
    var email = "";
    var uid = "";

    if (rst.ResponseCode !== "00") {
      console.log("unsuccessful");
      var new_oid = createOid();

      var query =
        "update userorders set pay_ref = " +
        new_oid +
        " where order_id=" +
        init_oid;

      db.serialize(() => {
        db.run(query, function(err) {
          if (err) {
            console.log("Update oid error: ", err);
          } else {
            var site_redirect_url =
              "https://amaka-server.glitch.me/confirm?oid=" + init_oid;

            // hash value computation
            var hashv =
              new_oid + prodid + "101" + amount + site_redirect_url + mac;
            var hash = sha512(hashv);

            db.all(
              "SELECT * from userorders where order_id='" + init_oid + "'",
              (err, rows) => {
                var row = rows[0];
                
                console.log("in redirect - -  row", row);

                var request_response = {
                  hash: hash,
                  url: site_redirect_url,
                  new_oid: new_oid,
                  address: row.address,
                  nm: row.fname + " " + row.lname,
                  phone: row.phone,
                  email: row.email,
                  uid: row.chat_id,

    
                  // response from transaction leg
                  r_amt: row.total_price * 100,
                  r_resp: req.body.resp,
                  r_txnref: req.body.txnref,
                  r_payRef: req.body.payRef,
                  r_desc: req.body.desc,

             // respoanse from confrimation leg
                  c_amt: formatNaira(row.total_price),
                  c_transRef: rst.MerchantReference,
                  c_ref: rst.PaymentReference,
                  c_respCode: rst.ResponseCode,
                  c_respDsc: rst.ResponseDescription,
                  c_date: rst.TransactionDate
                  
                 
                };
                 console.log("R_RESP: %j",request_response);

                // return payment status page; webpay status return before confrimation leg and return after confirmation leg
                res.render("redirect.html", request_response);
              }
            );
          }
        });
      });
    } else {
      console.log("successful");

      var request_response = {};

      db.all(
        "SELECT * from userorders where order_id='" + init_oid + "'",
        (err, rows) => {
          // console.log("in redirect - -  row", row);
          var row = rows[0];

          request_response = {
            address: row.address,
            cname: row.fname + " " + row.lname,
            phone: row.phone,
            email: row.email,
            uid: row.chat_id,
            slot: row.slot,

            // response from transaction leg
            r_amt: req.body.amount / 100,
            r_resp: req.body.resp,
            r_txnref: req.body.txnref,
            r_payRef: req.body.payRef,
            r_desc: req.body.desc,

            // respoanse from confrimation leg
            c_amt: formatNaira(rst.Amount / 100),
            c_transRef: rst.MerchantReference,
            c_ref: rst.PaymentReference,
            c_respCode: rst.ResponseCode,
            c_respDsc: rst.ResponseDescription,
            c_date: rst.TransactionDate
          };

          sendConfirmMails(request_response, init_oid);
          

          res.render("redirect.html", request_response);
        }
      );
    }

    // res.send(rst);
  }).end();
});


function sendConfirmMails(request_response, init_oid) {
  var elements = [];
          var total_p = 0;

          db.all(
            "SELECT * from order_items where order_id='" +
              init_oid +
              "' AND quantity > 0",
            (err, rows) => {
              console.log("Row ln: " + rows.length);
              if (rows.length > 0) {
                rows.forEach(row => {
                  var price = row.price;
                  var quantity = row.quantity;
                  var t_price = price * quantity;
                  
                  row.t_price = t_price;

                  total_p += t_price;
                  row.price = formatNaira(price);
                  elements.push(row);
                });
                total_p = formatNaira(total_p);
                // var dfee = formatNaira(districts[row.delivery_district]);

                var params = {
                  subject: "ChopNowNow Order Successful",
                  template: "customer",
                  items: elements,
                  item_total: total_p,
                  address: request_response.address,
                  cname: request_response.cname,
                  phone: request_response.phone,
                  cmail: request_response.email,
                  c_amt: request_response.c_amt,
                  oid: init_oid,
                  slot: request_response.slot
                };
                
                console.log("Mail Params: %j",params);
                
                mailer.send_mail(params);
                
                params.template = "order";
                params.subject = "New Product Order - "+init_oid;
                params.cmail = "chopnownoworders@gmail.com";
                
                mailer.send_mail(params);
                
                
              } else {
              }
            }
          );
}

function loadTimeSlots(start, end) {
  var timeSlots = [];
  var time = start;
  do {
    var slot = "";
    var from = time.locale("en-CA").format("LT");
    var inc = moment(time).add(1, "H");
    var to = inc.locale("en-CA").format("LT");
    time = time.add(30, "m");
    slot = from + " - " + to;
    timeSlots.push(slot);
  } while (time.format("HH:mm") !== end.format("HH:mm"));

  return timeSlots;
}

function getTimeSlots() {
  var now = moment();
  var day = now.day();
  // console.log("Day: ",day);

  var startTime = moment("08:00", "HH:mm");
  var endTime = moment("20:30", "HH:mm");
  var nowTime = now;

  var timeSlots = [];

  // console.log(now.format("YYYY-MM-DD HH:mm:ss"));
  var status = "";
  nowTime.add(1, "H");
  if (!nowTime.isSameOrAfter(startTime)) {
    timeSlots = loadTimeSlots(startTime, endTime);
  } else if (
    nowTime.isSameOrAfter(startTime) &&
    !nowTime.isSameOrAfter(endTime)
  ) {
    // nowTime.add(1,'H');
    if (nowTime.minute() > 30) {
      nowTime.subtract(nowTime.minute() - 30, "m");
    } else if (nowTime.minute() < 30) {
      nowTime.subtract(nowTime.minute(), "m");
    }

    timeSlots = loadTimeSlots(nowTime, endTime);
  } else if (nowTime.isSameOrAfter(endTime)) {
    timeSlots = loadTimeSlots(startTime, endTime);
  }

  return timeSlots;
}

var districts = {
  "AWOLOWO ROAD IKOYI + N400": 400,
  "DOLPHINE ESTATE + N400": 400,
  "IKOYI + N400": 400,
  "LAGOS ISLAND + N500": 500,
  "LEKKI PHASE 1 + N500": 500,
  "MARINA + N700": 700,
  "OBALENDE + N450": 450,
  "ONIKAN + N400": 400,
  "ONIRU + N300": 300,
  "VICTORIA ISLAND": 0
};

app.post("/broadcast-to-chatfuel/:uid", (request, response) => {
  var chat_bot_id = process.env.CB_ID;
  var chat_token = process.env.CB_TOKEN;
  var user_id = request.params.uid;

  var url_st =
    "https://api.chatfuel.com/bots/" +
    chat_bot_id +
    "/users/" +
    user_id +
    "/send?chatfuel_token=" +
    chat_token +
    "&chatfuel_block_name=order_confirm";

  const options = {
    uri: url_st,
    headers: {
      "Content-Type": "application/json"
    }
  };

  requestPromise.post(options).then(() => {
    response.json({});
  });
});

app.get("/show-form/:oid", (request, response) => {
  var oid = request.params.oid;

  let result =  async() => {
    return get_oitems(oid);
  }

  console.log("Ret: %j",result);

  var elements = [];
  var total_p = 0;

  db.all(
    "SELECT * from order_items where order_id='" + oid + "' AND quantity > 0",
    (err, rows) => {
      console.log("Row ln: " + rows.length);
      if (rows.length > 0) {
        rows.forEach(row => {
          var price = row.price;
          var quantity = row.quantity;
          var t_price = price * quantity;

          total_p += t_price;
          row.price = formatNaira(price);
          elements.push(row);
        });
        total_p = formatNaira(total_p);

        var timeslot = getTimeSlots();

        response.render("order-form.html", {
          items: elements,
          total: total_p,
          districts: districts,
          timeslots: timeslot,
          orderid: oid
        });
      } else {
        response.json({
          messages: [
            {
              text: "There are no items in your cart"
            }
          ],
          redirect_to_blocks: ["order-opt"]
        });
      }
    }
  );
});

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

app.post("/payment", (request, response) => {
  var oid = request.body.oid;
  // var oid = "20200118173554";

  var slot = request.body.slot;
  var coupon = request.body.coupon;
  var district = request.body.district;
  var info = request.body.info;
  var payment = request.body.payment;

  var address = "";
  var cname = "";
  var phone = "";
  var email = "";
  var pay_ref = "";
  var uid = "";

  var elements = [];
  var total_p = 0;

  db.serialize(() => {
    db.each(
      "SELECT * from userorders where order_id='" + oid + "'",
      (err, row) => {
        console.log("row", row);
        address = row.address;
        cname = row.fname + " " + row.lname;
        phone = row.phone;
        email = row.email;
        pay_ref = row.pay_ref;
        uid = row.chat_id;
      }
    );

    db.all(
      "SELECT * from order_items where order_id='" + oid + "' AND quantity > 0",
      (err, rows) => {
        console.log("Row ln: " + rows.length);
        if (rows.length > 0) {
          rows.forEach(row => {
            var price = row.price;
            var t_price = price * row.quantity;

            total_p += t_price;
            row.price = formatNaira(price);
            var item =
              formatNaira(price) +
              " * " +
              row.quantity +
              ": " +
              formatNaira(t_price);

            elements.push([row.title, item]);
          });
          // total_p+= districts[district];
          console.log("District: " + district);

          var ctotal = total_p + districts[district];

          var query =
            "update userorders set time_slot = '" +
            slot +
            "', total_price = " +
            ctotal +
            ", delivery_district = '" +
            district +
            "', order_info = '" +
            info +
            "'  where order_id=" +
            oid;

          // db.serialize(() => {
          db.run(query, function(err) {
            if (err) {
              console.log("Update userorder Error: ", err);
            }
          });

          var amtt = +(Math.round(ctotal + "e+2") + "e-2") * 100;

          console.log("AMTT: ", amtt);
          var amount = +(Math.round(amtt + "e+2") + "e-2");
          console.log("AMOUNT: ", amount);
          // var user_nm = "User";
          // var item_b = req.body.item;

          // redirect url from webpay
          var site_redirect_url =
            "https://agin.glitch.me/confirm?oid=" + oid;

          // hash value computation
          var hashv =
            pay_ref + prodid + "101" + amount + site_redirect_url + mac;
          var hash = sha512(hashv);

          ctotal = formatNaira(ctotal);
          total_p = formatNaira(total_p);
          
          var resp_data = {
            amt: amount,
            hash: hash,
            nm: cname,
            address: address,
            phone: phone,
            email: email,
            url: site_redirect_url,
            items: elements,
            total: total_p,
            district: district.replace("+", ""),
            slot: slot,
            orderid: oid,
            ctotal: ctotal,
            pay_ref: pay_ref,
            ps_key: ps_key,
            ptype: payment,
            uid: uid
          };
          
          console.log("PAY DATA: ", resp_data);

          response.render("confirm.html", resp_data);
        }
      }
    );
  });

  // response.render("confirm.html");
});


app.get("/menu_categorys", (request, response) => {
  var oid = request.query.oid;
  
  db.all(
    "SELECT * from m_cats",
    (err, rows) => {

      var elements = [];
      var messages = [];

      var count = 1;
      

      if(rows.length>0){

        rows.forEach(row => {

          var title = row.title;
      var tid = row.cid;

      var object = {
        title: title,
        subtitle: "Menu category",
        buttons: [
          {
            type: "json_plugin_url",
            url:
              "https://agin.glitch.me/getMenuItem?cat_id=" +
              tid +
              "&oid=" +
              oid,
            title: "Show"
          }
        ]
      };

      elements.push(object);

      if (count % 10 === 0) {
        console.log("counter: " + count);
        var message = {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: elements
            }
          }
        };
        messages.push(message);
        elements = [];
      }
      if (count === rows.length) {
        if (count % 10 !== 0) {
          var message = {
            attachment: {
              type: "template",
              payload: {
                template_type: "generic",
                elements: elements
              }
            }
          };
          messages.push(message);
        }
      }
      console.log("Elements: " + elements);
      count++;

        });


        response.json({
          messages: messages
        });


      }else{

        response.json({
          messages: [
            {
              text: "There are no categories to show"
            }
          ]
        });

      }


    }
  );

  

});



// endpoint to get all the dreams in the database
app.get("/get_description", (request, response) => {
  var id = request.query.id;
  var order_id = request.query.oid;
   
  db.all(
    "SELECT * from m_items where _id ='"+id+"'",
    (err, rows) => {

      let row = rows[0];
      var url =
            "https://agin.glitch.me/addItem?title=" +
            row.title +
            "&tid=" +
            row._id +
            "&price=" +
            row.price +
            "&img_url=" +
            row.img_url +
            "&oid=" +
            order_id;
      url = encodeURI(url);

      let obj = {
        messages: [
          {
            attachment: {
              type: "template",
              payload: {
              template_type: "button",
              text: row.desc,
              buttons: [
                {
                  url: url,
                  type:"json_plugin_url",
                  title:"Add to Cart"
                },
                {
                  type: "show_block",
                  block_names: ["Main Menu"],
                  title: "Go Back"
                }
                
              ]
            }
            }
          }
        ]
      };

    }
  );

});


// endpoint to get all the dreams in the database
app.get("/getMenuItem", (request, response) => {
  var category_id = request.query.cat_id;
  var order_id = request.query.oid;
   
  db.all(
    "SELECT * from m_items where cid ='"+category_id+"'",
    (err, rows) => {

      if(rows.length>0){

        var elements = [];
        var messages = [];

        var count = 1;

        rows.forEach(value => {


          var title = value.title;
          var tid = value._id;
          var price = value.price;
          var img_url = value.img_url;

          var url =
            "https://agin.glitch.me/addItem?title=" +
            title +
            "&tid=" +
            tid +
            "&price=" +
            price +
            "&img_url=" +
            img_url +
            "&oid=" +
            order_id;
          url = encodeURI(url);


          var drl = "https://agin.glitch.me/get_description?id=" + 
          tid +
          "&oid=" +
          order_id;

          var object = {
            title: title,
            subtitle: "N" + price,
            image_url: img_url,
            buttons: [
              {
                type: "json_plugin_url",
                url: drl,
                title:"View Details"
              },
              {
                type: "json_plugin_url",
                url: url,
                title: "Add To Cart"
              }
            ]
          };

          elements.push(object);

          if (count % 10 === 0) {
            console.log("counter: " + count);
            var message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: elements
                }
              }
            };
            messages.push(message);
            elements = [];
          }
          if (count === rows.length) {
            if (count % 10 !== 0) {
              var message = {
                attachment: {
                  type: "template",
                  payload: {
                    template_type: "generic",
                    elements: elements
                  }
                }
              };
              messages.push(message);
            }
          }
          console.log("Elements: " + elements);
          count++;
        });

        response.json({
          messages: messages
        });



      }else{

        response.json({
          messages: [
            {
              text: "There are no items to show"
            }
          ]
        });

      }

  });


});

function createOid() {
  var month,
    day,
    hr,
    min,
    sec,
    d = new Date();
  month = ("0" + (d.getUTCMonth() + 1)).slice(-2);
  day = ("0" + d.getUTCDate()).slice(-2);
  hr = ("0" + d.getUTCHours()).slice(-2);
  min = ("0" + d.getUTCMinutes()).slice(-2);
  sec = ("0" + d.getUTCSeconds()).slice(-2);
  var oid = d.getUTCFullYear() + month + day + hr + min + sec;
  return oid;
}

// endpoint to get all the dreams in the database
app.get("/setOrderId", (request, response) => {
  var fname = request.query.fname;
  var lname = request.query.lname;

  var email = request.query.email;

  var phone = request.query.phone;
  var user_id = request.query.uid;
  var address = request.query.address;

  var chk = request.query.chk;
  if(chk != 1){

    
    response.send(JSON.stringify("done"));

  }else{


    var oid = createOid();

    var now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    const dateLocal = new Date(now.getTime() - offsetMs);
    var date = dateLocal
      .toISOString()
      .slice(0, 19)
      .replace(/-/g, "/")
      .replace("T", " ")
      .split(" ")[0];

    console.log(fname + " " + lname);
    var query_vals = `("${oid}", "${oid}", "${fname}", "${lname}", "${date}", "${email}", "${address}", "${phone}", "${user_id}")`;
    var query =
      "INSERT INTO userorders (order_id, pay_ref , fname, lname, date, email, address, phone, chat_id) VALUES " +
      query_vals;
    db.serialize(() => {
      db.run(query);
    });

    response.json({
      set_attributes: {
        order_id: oid,
        chk: 0
      },
      messages: [
        {
          text: oid
        }
      ]
    });



  }
  
  
});

// endpoint to get all the dreams in the database
app.get("/addItem", (request, response) => {
  var title = request.query.title;
  var tid = request.query.tid;
  var price = request.query.price;

  var img_url = request.query.img_url;
  var take = request.query.take;

  if (take == null || take == undefined || take.length == 0) {
    take = 0;
  }
  var oid = request.query.oid;

  var query_vals = `("${oid}", "${tid}", "${title}", ${price}, ${take}, "${img_url}", 0)`;
  var query =
    "INSERT INTO order_items (order_id, item_id, title, price, takeaway, img_url, quantity) VALUES " +
    query_vals;

  db.serialize(() => {
    db.run(query, function(err) {
      if (err) {
        response.json({
          messages: [
            {
              text: "The item could not be added, please try again"
            }
          ]
        });
      } else {
        // console.log("val  " + this.lastID);
        response.json({
          set_attributes: {
            selected_item: this.lastID
          },
          redirect_to_blocks: ["no_option"]
        });
      }
    });
  });
});

// endpoint to get all the dreams in the database
app.get("/setQuantity", (request, response) => {
  var quantity = request.query.quantity;
  var tid = request.query.tid;

  var query =
    "update order_items set quantity = " + quantity + " where oitem_id=" + tid;

  db.serialize(() => {
    db.run(query, function(err) {
      if (err) {
        response.json({
          messages: [
            {
              text: "The quantity couldn't be set, please try again"
            }
          ],
          redirect_to_blocks: ["no_option"]
        });
      } else {
        response.json({
          messages: [
            {
              text: "Item has been added to your cart"
            }
          ],
          redirect_to_blocks: ["order-opt"]
        });
      }
    });
  });
});

// endpoint to get all the dreams in the database
app.get("/clearOrder", (request, response) => {
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from order_items",
      (err, row) => {
        console.log("row", row);
        db.run(
          `DELETE FROM order_items WHERE oitem_id=?`,
          row.oitem_id,
          error => {
            if (row) {
              // // console.log(`deleted row ${row.id}`);
            }
          }
        );
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});

app.get("/view-categories", (request, response) => {
  var resp_data = {
    msg: ""
  };

  db.all(
    "SELECT * from m_cats",
    (err, rows) => {
      resp_data.cats = rows;

      response.render("menu/categories", resp_data);
    }
  );


  
});


app.get("/view-items", (request, response) => {
  var resp_data = {
    msg: ""
  };

  db.all(
    "SELECT t1.title as title, t1.price as price, t1.img_url as img_url, t1.desc as desc, t1._id as _id, t2.title as category from m_items t1 join m_cats t2 on t1.cid = t2.cid ",
    (err, rows) => {
      resp_data.cats = rows;

      console.log("Items: %j",rows);

      response.render("menu/items", resp_data);
    }
  );


  
});

app.get("/add-category", (request, response) => {
  var resp_data = {
    msg: ""
  };
  response.render("menu/menu-cat", resp_data);
});


app.get("/add-item", (request, response) => {
  var resp_data = {
    msg: ""
  };

  db.all(
    "SELECT cid, title from m_cats",
    (err, rows) => {      

      resp_data.cats = rows;

      response.render("menu/menu-items", resp_data);
      
    }
  );


 
});


// endpoint to get all the dreams in the database
app.post("/insert-category", (request, response) => {
  var title = request.body.title;
  var description = request.body.description;
  // var price = request.query.price;

  var img_url = request.body.img;

  var query_vals = `("${title}", "${img_url}",  "${description}", 0)`;
  var query =
    "INSERT INTO m_cats (title,img_url,desc, active) VALUES " +
    query_vals;

  console.log("Insert Query: "+query);

  var resp_data = {
    msg: ""
  };

  db.serialize(() => {
    db.run(query, function(err) {
      if (err) {
        console.log("Insertion Error CAt:  " + err);
        
        resp_data.msg = "Category Not Added Successfully";
        response.render("menu/menu-cat", resp_data);

      } else {
        // console.log("val  " + this.lastID);
        resp_data.msg = "Category Added Successfully";
        response.render("menu/menu-cat", resp_data);

      }
    });
  });
});

// endpoint to get all the dreams in the database
app.post("/delete-category", (request, response) => {
  var cid = request.body.cid;

  db.serialize(() => {
    db.run("Delete from m_items where cid="+cid);
    db.run("Delete from m_cats where cid="+cid);
  });
  

  response.redirect("/view-categories");
  
});

// endpoint to get all the dreams in the database
app.post("/update-category", (request, response) => {
  var cid = request.body.cid;
  var title = request.body.title;
  var description = request.body.desc;
  var img_url = request.body.image;


  var query =
  "update m_cats set title = '" +
  title +
  "', desc = '" +
  description +
  "', img_url = '" +
  img_url +
  "'  where cid=" +
  cid;

  // db.serialize(() => {
  db.run(query, function(err) {
    if (err) {
      console.log("Update m_cats Error: ", err);
    }
  });
 
  

  response.redirect("/view-categories");
  
});

// endpoint to get all the dreams in the database
app.post("/update-item", (request, response) => {
  var id = request.body.id;
  var title = request.body.title;
  var description = request.body.desc;
  var price = request.body.price;
  var img_url = request.body.image;


  var query =
  "update m_items set title = '" +
  title +
  "', desc = '" +
  description +
  "', price = " +
  price +
  ", img_url = '" +
  img_url +
  "'  where _id=" +
  id;

  // db.serialize(() => {
  db.run(query, function(err) {
    if (err) {
      console.log("Update m_cats Error: ", err);
    }
  });
 
  

  response.redirect("/view-items");
  
});


// endpoint to get all the dreams in the database
app.post("/delete-item", (request, response) => {
  var cid = request.body.cid;

  db.serialize(() => {
    db.run("Delete from m_items where _id="+cid);
  });
  

  response.redirect("/view-items");
  
});



// endpoint to get all the dreams in the database
app.post("/insert-items", (request, response) => {
  var title = request.body.title;
  var description = request.body.description;
  var price = request.body.price;
  var category = request.body.category;
  var img_url = request.body.img;

  var query_vals = `( ${category}, "${title}", "${img_url}", ${price}, "${description}", 0)`;
  var query =
    "INSERT INTO m_items (cid,title,img_url,price,desc, active) VALUES " +
    query_vals;

  console.log("Insert Query: "+query);

  var resp_data = {
    msg: ""
  };

  db.serialize(() => {
    db.run(query, function(err) {
      if (err) {
        console.log("Insertion Error Items:  " + err);
        
        // resp_data.msg = "Item Not Added Successfully";
        // response.render("menu-items.html", resp_data);
        return;

      } else {
        // console.log("val  " + this.lastID);
        // resp_data.msg = "Category Added Successfully";
        response.redirect("/add-item");

      }
    });
  });
});


// endpoint to get all the dreams in the database
app.get("/showCart", (request, response) => {
  // var oid = "0";
  var oid = request.query.oid;

  var elements = [];
  var messages = [];

  var count = 1;

  db.all(
    "SELECT * from order_items where order_id='" + oid + "' AND quantity > 0",
    (err, rows) => {
      // console.log("Row ln: " + rows.length);
      if (rows.length > 0) {
        var total_p = 0;

        rows.forEach(row => {
          // // // console.log("Row: " + row);
          var title = row.title;
          var tid = row.oitem_id;
          var price = row.price;
          var img_url = row.img_url;
          var quantity = row.quantity;
          var t_price = price * quantity;
          var subtitle = "N" + price + " x " + quantity + " = " + t_price;

          total_p += t_price;

          var object = {
            title: title,
            subtitle: subtitle,
            image_url: img_url,
            buttons: [
              {
                type: "json_plugin_url",
                url:
                  "https://amaka-server.glitch.me/updateQuantity?tid=" +
                  tid,
                title: "Update Quantity"
              },
              {
                type: "json_plugin_url",
                url: "https://amaka-server.glitch.me/deleteItem?tid=" + tid,
                title: "Remove"
              }
            ]
          };

          elements.push(object);

          if (count % 10 === 0) {
            console.log("counter: " + count);
            var message = {
              attachment: {
                type: "template",
                payload: {
                  template_type: "generic",
                  elements: elements
                }
              }
            };
            messages.push(message);
            elements = [];
          }
          if (count === rows.length) {
            // // console.log("At end: " + rows.length);
            if (count % 10 !== 0) {
              var message = {
                attachment: {
                  type: "template",
                  payload: {
                    template_type: "generic",
                    elements: elements
                  }
                }
              };
              messages.push(message);
            }
          }
          // console.log("Elements: " + elements);
          count++;
        });

        var action_obj = {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: "Total Price: " + formatNaira(total_p),
              buttons: [
                {
                  type: "web_url",
                  url: "https://amaka-server.glitch.me/show-form/" + oid,
                  title: "Checkout",
                  messenger_extensions: true,
                  webview_height_ratio: "tall"
                },
                {
                  type: "show_block",
                  block_names: ["menu"],
                  title: "Add Item"
                }
              ]
            }
          }
        };

        messages.push(action_obj);

        response.json({
          messages: messages
        });
      } else {
        response.json({
          messages: [
            {
              text: "No items in your cart"
            }
          ],
          redirect_to_blocks: ["order-opt"]
        });
      }
      // response.send(JSON.stringify(rows));
    }
  );
});

// endpoint to get all the dreams in the database
app.get("/deleteItem", (request, response) => {
  var item = request.query.tid;
  db.serialize(() => {
    db.run("Delete from order_items where oitem_id=" + item);
  });

  response.json({
    messages: [
      {
        text: "Item removed from cart"
      }
    ],
    redirect_to_blocks: ["cart"]
  });
});

// endpoint to get all the dreams in the database
app.get("/updateQuantity", (request, response) => {
  var item = request.query.tid;

  response.json({
    set_attributes: {
      selected_item: item
    },
    redirect_to_blocks: ["no_option"]
  });
});




// endpoint to get all the dreams in the database
app.get("/updateTable", (request, response) => {
  db.serialize(() => {
    db.run("ALTER TABLE userorders ADD time_slot varchar(30)");
    db.run("ALTER TABLE userorders ADD chat_id varchar(30)");
    db.run("ALTER TABLE userorders ADD order_info text");
  });

  response.send(JSON.stringify("DOne"));
});



// endpoint to get all the dreams in the database
app.get("/clearTable", (request, response) => {
  db.serialize(() => {
    db.run("Delete from order_items");
    db.run("Delete from  userorders");
  });

  response.send(JSON.stringify("DOne"));
});




// // listen for requests :)
// var listener = app.listen(process.env.PORT, () => {
//   console.log(`server listening on port ${listener.address().port}`);
// });


// listen for requests :)
var listener = app.listen(8500, () => {
  console.log(`server listening on port ${listener.address().port}`);
});

