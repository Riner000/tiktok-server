const { WebcastPushConnection } = require("tiktok-live-connector");
const express = require("express");

const TIKTOK_USERNAME = "hello51211"; // 👈 đổi thành username của bạn (không có @)
const PORT = process.env.PORT || 3000;

const app = express();

// Route kiểm tra server
app.get("/", (req, res) => {
  res.send("TikTok Live Server Running 🚀");
});

// Start Express server
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

// ===== TikTok Connection =====

let tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

async function connectTikTok() {
  try {
    await tiktok.connect();
    console.log("✅ Connected to TikTok Live");
  } catch (err) {
    console.log("❌ TikTok connect failed:", err.message);
    console.log("⏳ Retry in 10 seconds...");
    setTimeout(connectTikTok, 10000);
  }
}

connectTikTok();

// ===== Events =====

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
