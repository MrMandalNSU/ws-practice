process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const WebSocket = require("isomorphic-ws");
const protobuf = require("protobufjs");

const root = protobuf.loadSync("./YPricingData.proto");

const Yaticker = root.lookupType("yaticker");
const ws = new WebSocket("wss://localhost:5000/v1/api/ws");

ws.onopen = function open() {
  console.log("IBKR connected");
  ws.send(
    JSON.stringify({
      session: "6364a2da.00000001",
    })
  );
};

ws.onclose = function close() {
  console.log("disconnected");
};

ws.onmessage = function incoming(data) {
  //   console.log("comming message");
  //   let dataObj = Yaticker.decode(Buffer.from(data.data, "base64"));
  //   let price = dataObj.price;
  //   console.log("Price: ", price);
  //   console.log(Yaticker.decode(new Buffer(data.data, "base64")));

  console.log(data);
};
