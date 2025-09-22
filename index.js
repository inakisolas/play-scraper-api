import express from "express";
import gplay from "google-play-scraper";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint: /version?appId=com.whatsapp
app.get("/version", async (req, res) => {
  try {
    const { appId } = req.query;
    if (!appId) return res.status(400).json({ error: "Missing appId" });

    const appInfo = await gplay.app({ appId });
    res.json({
      appId,
      title: appInfo.title,
      version: appInfo.version
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
