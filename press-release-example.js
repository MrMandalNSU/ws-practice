require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const redis = require("redis");
const WebSocket = require("ws");
fs = require("fs");

app.get("/healthcheck", (req, res) => res.send("Hello World!"));

if (!process.env.REDIS_PORT || process.env.REDIS_PORT === "") {
  console.log(
    "No redis port available in environment. Please set it. Closing environment"
  );
  process.exit(0);
}

if (!process.env.MILLISTREAM_SERVER || process.env.MILLISTREAM_SERVER === "") {
  console.log(
    "No Millistream push url available in environment. Please set it. Closing environment"
  );
  process.exit(0);
}

if (!process.env.MILLISTREAM_TOKEN || process.env.MILLISTREAM_TOKEN === "") {
  console.log(
    "No Millistream token url available in environment. Please set it. Closing environment"
  );
  process.exit(0);
}

var companiesInstruments = [];

const { channels } = require("./channels");

const redisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

// const subscriber = redis.createClient(redisOptions)
const publisher = redis.createClient(redisOptions);

let timerInterval;
let numberOfReleases = 0;

function ping() {
  publisher.publish(
    channels.pressReleaseDisconnectedDatabase,
    JSON.stringify({
      type: "press-release-ping",
      data: { number_of_releases: numberOfReleases },
    })
  );
  numberOfReleases = 0;
}

function startTimer() {
  ping();
  timerInterval = setInterval(() => {
    ping();
  }, 60 * 1000 * 5);
}

function stopTimer() {
  clearInterval(timerInterval);
  publisher.publish(
    channels.pressReleaseDisconnectedDatabase,
    JSON.stringify({ type: "press-release-pong", data: "pong" })
  );
}

function startWebsocket() {
  var socket = new WebSocket("wss://" + process.env.MILLISTREAM_SERVER, {
    origin: process.env.ORIGIN,
  });

  socket.onopen = function () {
    console.log("Connected to millistream push");
    publisher.publish(
      channels.pressReleaseConnectedDatabase,
      JSON.stringify({ type: "press-release-connected", data: "connected" })
    );
    const response = socket.send(
      JSON.stringify({
        token: process.env.MILLISTREAM_TOKEN,
        request: [
          {
            id: "1",
            mc: "1",
            insrefs: "8195,8196,8197,8201,8212,8213,8224,8225,8226",
          },
        ],
      })
    );

    startTimer();
  };

  socket.onerror = function (error) {
    console.log("Error, disconnected", error);
    stopTimer();
  };

  socket.onclose = function () {
    console.log("Disconnected");
    socket = null;
    publisher.publish(
      channels.pressReleaseDisconnectedDatabase,
      JSON.stringify({
        type: "press-release-disconnected",
        data: "disconnected",
      })
    );
    stopTimer();

    setTimeout(startWebsocket, 5000);
  };

  socket.onmessage = function (msg) {
    let data;
    try {
      data = JSON.parse(msg.data);

      data.instruments.map((instrument) => {
        instrument.newsheadline.map((pressRelease) => {
          if (pressRelease.hasOwnProperty(167)) {
            publisher.publish(
              channels.pressReleaseDatabase,
              JSON.stringify({
                type: "new-press-release",
                data: { data: pressRelease, provider: instrument.insref },
              })
            );
            numberOfReleases++;
          }
        });
      });
    } catch (e) {
      // console.log('invalid data', msg.data);
    }
  };
}

startWebsocket();

const port = `${process.env.PORT}` || 4000;

server.listen(port, () => console.log("listening on " + port));
