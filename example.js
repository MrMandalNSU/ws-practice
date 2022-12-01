let msg =
  "smd+265598+" +
  JSON.stringify({
    fields: ["31", "83"],
  });

msg = msg.toString("hex");

console.log(typeof msg);
