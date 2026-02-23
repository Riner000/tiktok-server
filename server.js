import express from "express";
import { Rcon } from "rcon-client";

const app = express();
app.use(express.json());

// ===== ENV =====
const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = parseInt(process.env.RCON_PORT);
const RCON_PASSWORD = process.env.RCON_PASSWORD;

// ===== STATE =====
let rcon = null;
let connecting = false;
let commandQueue = [];

// ===== CONNECT FUNCTION =====
async function connectRcon() {
    if (connecting) return;
    connecting = true;

    try {
        console.log("🔄 Connecting to RCON...");
        rcon = await Rcon.connect({
            host: RCON_HOST,
            port: RCON_PORT,
            password: RCON_PASSWORD,
            timeout: 5000
        });

        console.log("✅ RCON Connected");

        rcon.on("end", () => {
            console.log("❌ RCON Disconnected");
            rcon = null;
        });

        flushQueue();

    } catch (err) {
        console.log("⚠ RCON Connect Failed:", err.message);
        rcon = null;
    }

    connecting = false;
}

// ===== SEND COMMAND =====
async function sendCommand(command) {
    if (!rcon) {
        commandQueue.push(command);
        await connectRcon();
        return;
    }

    try {
        await rcon.send(command);
        console.log("✔ Sent:", command);
    } catch (err) {
        console.log("⚠ Send Failed, retrying...");
        rcon = null;
        commandQueue.push(command);
        await connectRcon();
    }
}

// ===== FLUSH QUEUE =====
async function flushQueue() {
    while (rcon && commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        try {
            await rcon.send(cmd);
            console.log("✔ Flushed:", cmd);
        } catch {
            commandQueue.unshift(cmd);
            rcon = null;
            break;
        }
    }
}

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
    res.send("TNTCoin Server Running 🚀");
});

// ===== GIFT ENDPOINT =====
app.post("/gift", async (req, res) => {
    const { type } = req.body;

    switch (type) {
        case "follow":
            await sendCommand("execute as @a run summon tnt");
            break;

        case "rose":
            await sendCommand("execute as @a run summon tnt");
            break;

        case "heart5":
            await sendCommand("execute as @a run summon tnt ~ ~5 ~");
            break;

        case "pig":
            await sendCommand("execute as @a run summon tnt ~ ~10 ~");
            break;

        case "reset":
            await sendCommand("kill @e[type=tnt]");
            break;

        case "minus3":
            await sendCommand("scoreboard players remove @a win 3");
            break;

        case "offlive":
            await sendCommand("kick @a Off Live Triggered");
            break;

        default:
            return res.status(400).send("Unknown gift");
    }

    res.send("Gift processed");
});

// ===== AUTO RECONNECT LOOP =====
setInterval(() => {
    if (!rcon) {
        connectRcon();
    }
}, 10000);

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});});

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
