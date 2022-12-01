process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const WebSocket = require("ws");

var socket = new WebSocket("wss://localhost:5000/v1/api/ws");

socket.onopen = async function () {
  console.log("Connected to IBKR");

  //Authentication with session id
  socket.send(
    JSON.stringify({
      session: "d1d9c3ce40277648842182ef2ae6219b",
    })
  );

  //Subscribing to topic close price
  socket.send(
    "smd+265598+" +
      JSON.stringify({
        fields: ["31", "83"],
      })
  );

  //Subscribing to topic historical data
  socket.send(
    "smh+265598+" +
      '{"exchange":"ISLAND","period":"2h","bar":"5min","outsideRth":false,"source":"trades","format":"%h/%l}'
    // JSON.stringify({
    //   exchange: "ISLAND",
    //   period: "2h",
    //   bar: "5min",
    //   outsideRth: false,
    //   source: "trades",
    //   format: "%h/%l",
    // })
  );
};

socket.onmessage = function (msg) {
  try {
    // console.log(msg);

    let data;
    data = JSON.parse(msg.data.toString("utf8"));
    console.log("Data", data);
  } catch (e) {
    console.log("invalid data", msg.data);
  }
};
