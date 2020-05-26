const openpgp = require("openpgp");
const fs = require("fs");

module.exports = {
  sum: function(a, b) {
    return a + b;
  },
  encrypt: function(msg) {
    var pk = "";

    try {
      pk = fs.readFileSync("keys/pu.txt", "utf8");
      console.log(pk);

      var options = {
        data: "This is a very secret message",
        publicKeys: openpgp.key.readArmored(pk).keys
      };
      openpgp.encrypt(options).then(encryptedData => {
        console.log(encryptedData.data);
      });

      //       var publicKey = openpgp.key.readArmored(pk);
      //       var pgpMessage = openpgp.encrypt(publicKey.keys, "hello");

      //       console.log(pgpMessage);
    } catch (e) {
      console.log("Error:", e.stack);
    }
  }
};
