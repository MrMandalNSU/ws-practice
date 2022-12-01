process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const WebSocket = require("ws");

var socket = new WebSocket("wss://localhost:5000/v1/api/ws");

let cnt = 0;
let serverid = "2278"; //To unsbuscribe

let isAuth = true; //default auth stat is false

//sbd+DU12345+265598+ARCA

let accountID = "DU5381496";
let contractID = "265598"; //APPl
let exchangeID = "ARCA";

socket.onopen = function () {
  console.log("Connected to IBKR");

  if (isAuth == true) {
    setInterval(() => {
      console.log("Inside the timer no: ", cnt);
      console.log("Auth Stat: ", isAuth);
      cnt++;

      // //Subscribing to topic close price
      // socket.send(
      //   "smd+265598+" +
      //     JSON.stringify({
      //       fields: ["31", "83"],
      //     })
      // );

      //Subscribing to market depth data
      socket.send("sbd" + accountID + contractID + exchangeID);

      // //Subscribing to topic historical data
      // socket.send(
      //   "smh+265598+" +
      //     JSON.stringify({
      //       exchange: "ISLAND",
      //       period: "2h",
      //       bar: "5min",
      //       outsideRth: false,
      //       source: "trades",
      //       format: "%h/%l",
      //     })
      // );

      // //Unsubscribing to topic with server id
      // socket.send("umh+" + serverid);

      serverid++;
    }, 10000);
  } else {
    console.log("Auth Stat: ", isAuth);
  }

  //Authentication with session id
  socket.send(
    JSON.stringify({
      session: "d1d9c3ce40277648842182ef2ae6219b",
    })
  );

  //   //Subscribing to topic close price
  //   socket.send(
  //     "smd+265598+" +
  //       JSON.stringify({
  //         fields: ["31", "83"],
  //       })
  //   );

  //   //Subscribing to topic historical data
  //   socket.send(
  //     "smh+265598+" +
  //       JSON.stringify({
  //         exchange: "ISLAND",
  //         period: "2h",
  //         bar: "5min",
  //         outsideRth: false,
  //         source: "trades",
  //         format: "%h/%l",
  //       })
  //   );
};

let checkAuth = (msg) => {
  //setting auth stat
  if (msg?.topic == "sts") {
    msg?.arg?.authenticated == true ? (isAuth = true) : (isAuth = false); //set reauth here
  }
};

socket.onmessage = function (msg) {
  try {
    // console.log(msg);

    let data;
    data = JSON.parse(msg.data.toString("utf8"));
    console.log("Data", data);

    checkAuth(msg); //to set auth stat
  } catch (e) {
    console.log("invalid data", msg.data);
  }
};
