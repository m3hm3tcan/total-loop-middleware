import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// POST /activate → client buraya istek atar
app.post("/activate", async (req, res) => {
  try {
    const { activation_code, device_fingerprint } = req.body;

    if (!activation_code || !device_fingerprint) {
      return res
        .status(400)
        .json({ error: "activation_code ve device_fingerprint zorunlu" });
    }

    // Ana lisans sunucusuna güvenli istek
    const response = await axios.post(
      process.env.LICENSE_SERVER_URL,
      { activation_code, device_fingerprint },
      {
        headers: {
          "X-LICENSE-AUTH": process.env.LICENSE_SERVER_SECRET,
        },
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

const port = process.env.PORT || 4002;
app.listen(port, () => {
  console.log(`Middleware running on port ${port}`);
});
