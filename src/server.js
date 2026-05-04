import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

/**
 * =========================
 * HEALTH CHECK (Middleware)
 * =========================
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "middleware",
    uptime: process.uptime(),
  });
});

/**
 * =========================
 * CORE KEEP-ALIVE PING
 * =========================
 */
const pingCore = async () => {
  try {
    await axios.get(`https://total-loop-server.onrender.com/health`);
    console.log("[KEEP-ALIVE] Core is alive");
  } catch (err) {
    console.log("[KEEP-ALIVE] Core ping failed");
  }
};

// 10 dakikada bir core’u uyandır
setInterval(pingCore, 10 * 60 * 1000);

/**
 * =========================
 * CLIENT → ACTIVATE ROUTE
 * =========================
 */
app.post("/activate", async (req, res) => {
  try {
    const { activation_code, device_fingerprint } = req.body;

    if (!activation_code || !device_fingerprint) {
      return res.status(400).json({
        error: "activation_code ve device_fingerprint zorunlu",
      });
    }

    const response = await axios.post(
      `${process.env.LICENSE_SERVER_URL}/internal/activate`,
      { activation_code, device_fingerprint },
      {
        headers: {
          "X-LICENSE-AUTH": process.env.LICENSE_SERVER_SECRET,
        },
        timeout: 10000,
      },
    );

    return res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(400).json({
      error: err.response?.data?.error || "Aktivasyon başarısız",
    });
  }
});

/**
 * =========================
 * START SERVER
 * =========================
 */
const port = process.env.PORT || 4002;

app.listen(port, () => {
  console.log(`Middleware running on port ${port}`);
});
