const WebSocket = require("isomorphic-ws");
const protobuf = require("protobufjs");

const root = protobuf.loadSync("./YPricingData.proto");

const Yaticker = root.lookupType("yaticker");
const ws = new WebSocket("wss://streamer.finance.yahoo.com");

ws.onopen = function open() {
  console.log("connected");
  ws.send(
    JSON.stringify({
      subscribe: ["GOOGL"],
    })
  );
};

ws.onclose = function close() {
  console.log("disconnected");
};

ws.onmessage = function incoming(data) {
  //   console.log("comming message");

  let dataObj = Yaticker.decode(Buffer.from(data.data, "base64"));

  let price = dataObj.price;

  let info = {
    id: dataObj.id,
    exchange: dataObj.exchange,
    price: dataObj.price,
  };

  // console.log("Price: ", price);
  // console.log("Obj ", dataObj);
  console.log(JSON.stringify(info, null, 2));

  //   console.log(Yaticker.decode(new Buffer(data.data, "base64")));
};
