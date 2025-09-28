import express from "express";
import gplay from "google-play-scraper";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// Función auxiliar para scrapear la versión de la web
async function scrapeVersionFromWeb(appId, lang = "es", country = "es") {
  const url = `https://play.google.com/store/apps/details?id=${appId}&hl=${lang}&gl=${country}`;
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  // ⚠️ el selector puede cambiar, pero ahora mismo la versión suele estar en divs con itemprop
  let version = null;
  $("div[jsname='Sn4fUc']").each((i, el) => {
    const text = $(el).text().trim();
    if (/^\d+(\.\d+)+$/.test(text)) {
      version = text;
    }
  });

  return version;
}

// Endpoint: /version?appId=com.whatsapp
app.get("/version", async (req, res) => {
  try {
    const { appId, lang, country } = req.query;
    if (!appId) return res.status(400).json({ error: "Missing appId" });

    let appInfo;
    try {
      appInfo = await gplay.app({
        appId,
        ...(lang ? { lang } : {}),
        ...(country ? { country } : {})
      });
    } catch (err) {
      console.error("⚠️ google-play-scraper falló:", err.message);
    }

    let version = appInfo?.version || null;

    // Fallback si no devuelve nada o se queda en la misma versión
    if (!version || version === "7.82.0") {
      console.log("➡️ Usando fallback scrape para", appId);
      const scrapedVersion = await scrapeVersionFromWeb(appId, lang, country);
      if (scrapedVersion) version = scrapedVersion;
    }

    res.json({
      appId,
      title: appInfo?.title || "N/A",
      version: version || "unknown"
    });
  } catch (err) {
    console.error("❌ Error en /version:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
