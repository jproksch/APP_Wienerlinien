/**
 * Extrahiert Routeninformationen aus einem XML-String und konvertiert diese in ein JSON-Format.
 * 
 * Diese Methode analysiert einen XML-String, der <itdPartialRouteList>-Elemente enthält, und extrahiert daraus Informationen
 * zu einzelnen Teilrouten. Für jede Teilroute werden Details wie Dauer, Verkehrsmittel und Haltestellenpunkte gesammelt.
 * Die ersten zwei Punkte jeder Teilroute werden ignoriert, um bestimmte Voraussetzungen der Routeninformation zu erfüllen.
 * Zusätzlich wird für jede Teilroute, falls möglich, die Dauer basierend auf dem ersten und letzten berücksichtigten Punkt berechnet.
 * Alle gesammelten Informationen werden in ein JSON-Format umgewandelt, wobei auch separate GPS-Punkte für weitere Verwendungen extrahiert werden.
 *
 * @param {string} xmlData - Der XML-String, der die Routeninformationen enthält.
 * @returns {Array} Ein Array bestehend aus zwei Elementen: Ein JSON-String, der die extrahierten Routeninformationen enthält,
 *                  und ein Array von Objekten mit den GPS-Punkten der Haltestellen.
 */
export function extractItdPartialRouteListToJsonString(xmlData) {
  // Ein regulärer Ausdruck, der <itdPartialRouteList>-Elemente und deren Inhalte im XML-String sucht.
  const itdPartialRouteListRegex = /<itdPartialRouteList>.*?<\/itdPartialRouteList>/gs;
  // Verwendet den regulären Ausdruck, um alle Vorkommen von <itdPartialRouteList> im Eingabe-XML zu finden.
  const itdPartialRouteListMatch = xmlData.match(itdPartialRouteListRegex);
  // Initialisiert ein Array für die gesammelten Routen.
  let routes = [];
  // Initialisiert ein Array für GPS-Punkte.
  let punkteGPS = [];

  // Überprüft, ob <itdPartialRouteList>-Elemente im XML gefunden wurden.
  if (itdPartialRouteListMatch) {
    // Iteriert über jede gefundene <itdPartialRouteList>.
    itdPartialRouteListMatch.forEach((partialRouteList) => {
      // Ein regulärer Ausdruck, der <itdPartialRoute>-Elemente in der aktuellen <itdPartialRouteList> sucht.
      const itdPartialRouteRegex = /<itdPartialRoute .*?<\/itdPartialRoute>/gs;
      // Findet alle <itdPartialRoute>-Elemente innerhalb der aktuellen <itdPartialRouteList>.
      const itdPartialRoutesMatches = partialRouteList.match(itdPartialRouteRegex) || [];
      
      // Iteriert über jede gefundene <itdPartialRoute>.
      itdPartialRoutesMatches.forEach((route, index) => {
        // Initialisiert ein Objekt, um Details der aktuellen Route zu speichern.
        let routeDetails = {
          Teilroute: index + 1, // Setzt die Teilroutennummer.
          Dauer: "N/A", // Standardwert für die Dauer.
          Verkehrsmittel: [], // Array für Verkehrsmittel.
          Punkte: [] // Array für Punkte (Haltestellen) auf der Route.
        };

        // Findet <itdMeansOfTransport>-Elemente innerhalb der aktuellen <itdPartialRoute>.
        const transportMatches = route.match(/<itdMeansOfTransport .*?\/>/gs) || [];
        // Iteriert über jedes gefundene Verkehrsmittel.
        transportMatches.forEach((means) => {
          // Extrahiert Attribute des Verkehrsmittels und speichert sie in einem Objekt.
          const attrs = means.match(/(\w+)="([^"]*)"/g).reduce((acc, attr) => {
            const [key, value] = attr.split("=");
            acc[key] = value.replace(/"/g, ''); // Entfernt Anführungszeichen.
            return acc;
          }, {});
          
          // Fügt das Verkehrsmittel zum Verkehrsmittel-Array der aktuellen Route hinzu.
          routeDetails.Verkehrsmittel.push({
            Typ: attrs.type || "N/A",
            Name: attrs.name || "N/A",
            Kurzname: attrs.shortName || "",
            Symbol: attrs.symbol || "",
            Ziel: attrs.destination || "N/A"
          });
        });

        // Versucht, die Dauer der Route aus dem <itdDuration>-Element zu extrahieren.
        const durationMatch = route.match(/<itdDuration .*?timeMinute="(\d+)"\/>/);
        // Setzt die Dauer, falls gefunden.
        routeDetails.Dauer = durationMatch ? `${durationMatch[1]} Minuten` : "N/A";

        // Findet <itdPoint>-Elemente (Haltestellen) innerhalb der aktuellen <itdPartialRoute>.
        const pointsMatches = route.match(/<itdPoint .*?<\/itdPoint>/gs) || [];
        // Initialisiert Variablen für die Start- und Endzeit.
        let startTime = null;
        let endTime = null;

        // Iteriert über jeden gefundenen Punkt, ignoriert dabei die ersten zwei Punkte jeder Teilroute.
        pointsMatches.forEach((point, idx) => {
          if (idx < 2) return; // Ignoriert die ersten zwei Punkte.
          
          // Extrahiert Informationen aus dem <itdPoint>-Element.
          const name = point.match(/name="([^"]*)"/)?.[1];
          const stopID = point.match(/stopID="([^"]*)"/)?.[1];
          const platform = point.match(/platform="([^"]*)"/)?.[1];

          // Findet <itdTime>-Elemente für die Zeitangaben.
          const timeMatches = point.match(/<itdTime .*?>/g) || [];
          const times = timeMatches.map(time => {
            const hour = time.match(/hour="(\d+)"/)?.[1];
            const minute = time.match(/minute="(\d+)"/)?.[1];
            return hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : null;
          }).filter(time => time !== null && time !== "00:00");

          // Wählt die erste gültige Zeit für den Punkt.
          let time = times.length > 0 ? times[0] : "N/A";

          // Speichert die Zeit des ersten und letzten Punktes nach dem Ignorieren.
          if (idx === 2) startTime = time; // Erster gültiger Punkt.
          if (idx === pointsMatches.length - 1) endTime = time; // Letzter Punkt der Teilroute.
          
          // Fügt den Punkt zum Punkte-Array der aktuellen Route hinzu.
          routeDetails.Punkte.push({
            Name: name,
            StopID: stopID,
            Platform: platform,
            Zeit: time
          });
          // Fügt Punktinformationen zum `punkteGPS`-Array hinzu.
          punkteGPS.push({
            Name: name,
            StopID: stopID,
          });
        });

        // Berechnet die Dauer zwischen dem ersten und letzten Punkt der Teilroute, wenn verfügbar.
        if (startTime && endTime) {
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            let duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
            if (duration < 0) {
                duration += 24 * 60; // Korrektur, falls die Berechnung negativ ist (über Mitternacht hinweg).
            }
            routeDetails.Dauer = `${duration} Minuten`;
        }

        // Fügt die vollständigen Routendetails zum `routes`-Array hinzu.
        routes.push(routeDetails);
      });
    });
  } else {
    // Gibt einen Fehler zurück, wenn keine <itdPartialRouteList>-Elemente gefunden wurden.
    return JSON.stringify({ error: "Keine itdPartialRouteList gefunden." });
  }

  // Gibt die gesammelten Routeninformationen und GPS-Punkte als JSON-String zurück.
  return [JSON.stringify(routes, null, 2), punkteGPS];
}