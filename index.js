import express from "express";
import gplay from "google-play-scraper";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Endpoint: /version?appId=com.whatsapp
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

// ✅ Endpoint: /app?appId=com.whatsapp
// Devuelve versión, rating y nº de valoraciones
app.get("/app", async (req, res) => {
  try {
    const { appId } = req.query;
    if (!appId) return res.status(400).json({ error: "Missing appId" });

    const appInfo = await gplay.app({ appId });
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

// ✅ Endpoint: /reviews?appId=com.whatsapp&num=20
// Devuelve las últimas reseñas ordenadas por más recientes
app.get("/reviews", async (req, res) => {
  try {
    const { appId, num } = req.query;
    if (!appId) return res.status(400).json({ error: "Missing appId" });

    const reviews = await gplay.reviews({
      appId,
      sort: gplay.sort.NEWEST,
      num: parseInt(num) || 20
    });

    // Solo devolvemos lo que interesa
    const simplified = reviews.data.map(r => ({
      userName: r.userName,
      title: r.title,
      text: r.text,
      score: r.score,
      date: r.date
    }));

    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
