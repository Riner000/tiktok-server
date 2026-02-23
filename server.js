const { WebcastPushConnection } = require("tiktok-live-connector");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const TIKTOK_USERNAME = "hello51211"; // đổi username
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

/* ================= EXPRESS ================= */

app.get("/", (req, res) => {
  res.send("TikTok Minecraft Bridge Running 🚀");
});

/* ================= WEBSOCKET ================= */

wss.on("connection", (ws) => {
  console.log("Minecraft connected");
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
    console.log("Minecraft disconnected");
  });
});

/* ================= START SERVER ================= */

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

/* ================= TIKTOK ================= */

const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

async function connectTikTok() {
  try {
    await tiktok.connect();
    console.log("Connected to TikTok Live");
  } catch (err) {
    console.log("TikTok error:", err.message);
    setTimeout(connectTikTok, 10000);
  }
}

connectTikTok();

/* ================= BROADCAST ================= */

function broadcast(data) {
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
}

/* ================= EVENTS ================= */

tiktok.on("chat", (data) => {
  broadcast({
    chatUser: data.uniqueId,
    chatMessage: data.comment
  });
});

tiktok.on("gift", (data) => {

  let tntAmount = data.repeatCount || 1;

  broadcast({
    user: data.uniqueId,
    tnt: tntAmount
  });

});
tiktok.on("connected", () => {
  console.log("🎉 TikTok connection established");
});

tiktok.on("gift", (data) => {
  console.log("🎁 Gift received:");
  console.log("User:", data.uniqueId);
  console.log("Gift ID:", data.giftId);
});

tiktok.on("chat", (data) => {
  console.log("💬 Chat:", data.uniqueId, ":", data.comment);
});

tiktok.on("error", (err) => {
  console.log("⚠ TikTok error:", err.message);
});
