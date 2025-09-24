import express from "express";
import gplay from "google-play-scraper";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint: /version?appId=com.whatsapp
app.get("/version", async (req, res) => {
  try {
    const { appId, lang, country } = req.query;
    if (!appId) return res.status(400).json({ error: "Missing appId" });

    const appInfo = await gplay.app({
      appId,
      lang: lang || "es",        // idioma por defecto español
      country: country || "es"   // país por defecto España
    });

    res.json({
      appId,
      title: appInfo.title,
      version: appInfo.version
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: /app?appId=com.whatsapp&lang=es&country=es
// Devuelve rating y nº de valoraciones
app.get("/app", async (req, res) => {
  try {
    const { appId, lang, country } = req.query;
    if (!appId) return res.status(400).json({ error: "Missing appId" });

    const appInfo = await gplay.app({
      appId,
      lang: lang || "es",
      country: country || "es"
    });

    res.json({
      appId,
      title: appInfo.title,
      version: appInfo.version,
      score: appInfo.score,      // ⭐ rating medio
      ratings: appInfo.ratings,  // 📊 nº total de valoraciones
      reviews: appInfo.reviews   // 👥 nº de reseñas (si está disponible)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: /reviews?appId=com.whatsapp&num=20&lang=es&country=es
app.get("/reviews", async (req, res) => {
  try {
    const { appId, num, lang, country } = req.query;
    if (!appId) return res.status(400).json({ error: "Missing appId" });

    const reviews = await gplay.reviews({
      appId,
      sort: gplay.sort.NEWEST,   // 🔥 reseñas más recientes
      num: parseInt(num) || 20,  // cuántas reseñas traer
      lang: lang || "es",        // idioma (ej. "es", "en")
      country: country || "es"   // país (ej. "es", "us")
    });

    res.json(reviews.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
