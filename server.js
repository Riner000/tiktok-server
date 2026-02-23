const { WebcastPushConnection } = require("tiktok-live-connector");
const express = require("express");

const TIKTOK_USERNAME = "buonviquadeptrai_1";
const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  res.send("TikTok Server Running");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

tiktok.connect()
  .then(() => console.log("Connected to TikTok Live"))
  .catch(err => console.error("TikTok error:", err));

tiktok.on("gift", (data) => {
  console.log("Gift:", data.uniqueId, data.giftId);
});
