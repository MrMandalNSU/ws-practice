process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const WebSocket = require("ws");

var socket = new WebSocket("wss://localhost:5000/v1/api/ws");

socket.onopen = function () {
  console.log("Connected to IBKR");

  socket.send(
    "smd+265598+" +
      JSON.stringify({
        fields: ["31", "83"],
      })
  );

  // console.log(response);
};

socket.onclose = function () {
  console.log("disconnected");
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
