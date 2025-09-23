// 📌 Configuración
var MAX_REVIEWS = 20;  // cambia a 50, 100... si quieres más

function updateAndroidReviews() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var appsSheet = ss.getSheetByName("Apps");
  var reviewsSheet = ss.getSheetByName("Reviews Android");
  var lastRow = appsSheet.getLastRow();

  for (var i = 2; i <= lastRow; i++) {
    var appName  = appsSheet.getRange(i, 1).getValue();
    var appId    = appsSheet.getRange(i, 2).getValue();
    var platform = (appsSheet.getRange(i, 3).getValue() || "").toLowerCase();

    if (platform === "android" && appId) {
      try {
        var url = "https://play-scraper-api.onrender.com/reviews?appId=" + encodeURIComponent(appId) + "&num=" + MAX_REVIEWS;
        var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
        var reviews = JSON.parse(response.getContentText());

        if (!reviews || reviews.length === 0) {
          Logger.log("ℹ️ No hay reseñas para " + appName + " (" + appId + ")");
          continue;
        }

        // Ordenar por fecha descendente
        reviews.sort(function(a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Buscar la última fecha ya guardada
        var lastSavedDate = getLastReviewDate(reviewsSheet, appId, "Android");

        // Filtrar solo reseñas más nuevas
        var newReviews = reviews.filter(function(r) {
          var reviewDate = new Date(r.date).getTime();
          return !lastSavedDate || reviewDate > lastSavedDate;
        });

        if (newReviews.length > 0) {
          Logger.log("➕ Añadiendo " + newReviews.length + " reseñas nuevas para " + appName);
        } else {
          Logger.log("ℹ️ No hay reseñas nuevas para " + appName);
        }

        // Insertar nuevas reseñas ARRIBA
        newReviews.reverse().forEach(function(r) {
          reviewsSheet.insertRowBefore(2);
          reviewsSheet.getRange(2, 1, 1, 8).setValues([[
            appName,
            appId,
            "Android",
            r.userName || "",
            r.title || "",
            r.text || "",
            r.score || "",
            new Date(r.date)
          ]]);
        });

      } catch (err) {
        Logger.log("❌ Reviews Android fallo " + appId + ": " + err);
      }
    }
  }
}
