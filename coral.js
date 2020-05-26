const fs = require("fs");
var crypto = require('crypto');


var sha512 = require("js-sha512");
var request = require("request");

var httpBuildQuery = require("http-build-query");

var compression = require("compression");
var helmet = require("helmet");

const url = require("url");
const requestPromise = require("request-promise");

let un = "chopnownow";
let pass = "2009011220@012#8";
let mid = "1057CH020000002";
let tid = "1057CH02";
let amt = "400";
let rtUrl = "https://amaka-server.glitch.me/cgate-callback";
let tt = "0";



function testFn() {

    // let pk = fs.readFileSync("keys/pub.txt", "utf8");
    let pk = "0030ceb3-484b-41b6-bd47-febc63e521d4";
    //   console.log(pk);

    let signStr = un+"|"+pass+"|"+mid+"|"+tid+"|"+amt+"|"+rtUrl+"|"+tt;

    signStr += pk;
    
    var hash = crypto.createHash('md5').update(signStr).digest('hex');

    let pObj = 
    {
        "Username": un,
        "Password": pass,
        "MerchantID": mid,
        "TerminalID": tid,
        "Amount": amt,
        "ReturnUrl": rtUrl,
        "TransactionType": tt,
        "signature": hash
    };



    console.log(pObj);
  const options = {
    uri:
      "https://testdev.coralpay.com/CgatePayV2/api/Pay",
    json:true,
    body: pObj
  };

  requestPromise.post(options).then(function(data) {
    // console.log(data);
    var parsedResponse = data;

    console.log(parsedResponse);

  });


};

testFn();