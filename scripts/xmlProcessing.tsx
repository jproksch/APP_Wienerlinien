// Definiert eine Funktion, um Routeninformationen aus einer XML-Antwort zu extrahieren und in JSON umzuwandeln.
export function extractItdPartialRouteListToJson(xmlData) {
    // Regex zum Finden von <itdPartialRouteList>-Elementen im XML-String
    const itdPartialRouteListRegex = /<itdPartialRouteList>.*?<\/itdPartialRouteList>/gs;
    // Versucht, alle <itdPartialRouteList>-Elemente zu matchen
    const itdPartialRouteListMatch = xmlData.match(itdPartialRouteListRegex);
    // Initialisiert ein Array, um die extrahierten Routen zu speichern
    let routes = [];
  
    // Überprüft, ob <itdPartialRouteList>-Elemente gefunden wurden
    if (itdPartialRouteListMatch) {
      // Iteriert über jedes gefundene <itdPartialRouteList>-Element
      itdPartialRouteListMatch.forEach((partialRouteList) => {
        // Regex zum Finden von <itdPartialRoute>-Elementen innerhalb eines <itdPartialRouteList>-Elements
        const itdPartialRouteRegex = /<itdPartialRoute .*?<\/itdPartialRoute>/gs;
        // Versucht, alle <itdPartialRoute>-Elemente innerhalb des aktuellen <itdPartialRouteList>-Elements zu matchen
        const itdPartialRoutesMatches = partialRouteList.match(itdPartialRouteRegex) || [];
        
        // Iteriert über jedes gefundene <itdPartialRoute>-Element
        itdPartialRoutesMatches.forEach((route, index) => {
          // Initialisiert ein Objekt, um Details der aktuellen Route zu speichern
          let routeDetails = {
            Teilroute: index + 1, // Index der Teilroute, beginnend bei 1
            Dauer: "N/A", // Standardwert für die Dauer
            Verkehrsmittel: [], // Array, um Verkehrsmittel auf dieser Route zu speichern
            Punkte: [] // Array, um Punkte (Haltestellen) auf dieser Route zu speichern
          };
  
          // Regex zum Finden von <itdMeansOfTransport>-Elementen innerhalb eines <itdPartialRoute>-Elements
          const transportMatches = route.match(/<itdMeansOfTransport .*?\/>/gs) || [];
          // Iteriert über jedes gefundene <itdMeansOfTransport>-Element
          transportMatches.forEach((means) => {
            // Extrahiert Attribute des <itdMeansOfTransport>-Elements und speichert sie in einem Objekt
            const attrs = means.match(/(\w+)="([^"]*)"/g).reduce((acc, attr) => {
              const [key, value] = attr.split("=");
              acc[key] = value.replace(/"/g, ''); // Entfernt Anführungszeichen
              return acc;
            }, {});
            
            // Fügt das extrahierte Verkehrsmittel zum Verkehrsmittel-Array der Route hinzu
            routeDetails.Verkehrsmittel.push({
              Typ: attrs.type || "N/A",
              Name: attrs.name || "N/A",
              Kurzname: attrs.shortName || "",
              Symbol: attrs.symbol || "",
              Ziel: attrs.destination || "N/A"
            });
          });
  
          // Versucht, die Dauer der Route aus dem <itdDuration>-Element zu extrahieren
          const durationMatch = route.match(/<itdDuration .*?timeMinute="(\d+)"\/>/);
          // Setzt die Dauer, falls gefunden, sonst bleibt sie "N/A"
          routeDetails.Dauer = durationMatch ? `${durationMatch[1]} Minuten` : "N/A";
  
          // Regex zum Finden von <itdPoint>-Elementen innerhalb eines <itdPartialRoute>-Elements
          const pointsMatches = route.match(/<itdPoint .*?<\/itdPoint>/gs) || [];
          // Variablen, um die Zeiten der ersten beiden Punkte zu speichern, falls nötig für die Berechnung der Dauer
          let firstPointTime = null;
          let secondPointTime = null;
  
          // Iteriert über jedes gefundene <itdPoint>-Element
          pointsMatches.forEach((point, idx) => {
            // Extrahiert Name, stopID und Plattform aus dem <itdPoint>-Element
            const name = point.match(/name="([^"]*)"/)?.[1];
            const stopID = point.match(/stopID="([^"]*)"/)?.[1];
            const platform = point.match(/platform="([^"]*)"/)?.[1];
  
            // Versucht, die Zeit(en) aus dem <itdTime>-Element zu extrahieren
            const timeMatches = point.match(/<itdTime .*?>/g) || [];
            const times = timeMatches.map(time => {
              const hour = time.match(/hour="(\d+)"/)?.[1];
              const minute = time.match(/minute="(\d+)"/)?.[1];
              // Gibt formatierte Zeit zurück, falls Stunde und Minute vorhanden sind
              return hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : null;
            }).filter(time => time !== null && time !== "00:00"); // Filtert ungültige Zeiten heraus
  
            // Wählt die erste gültige Zeit als Zeit für diesen Punkt
            let time = times.length > 0 ? times[0] : "N/A";
  
            // Speichert die Zeit des ersten und zweiten Punktes, falls vorhanden
            if (idx === 0) firstPointTime = time;
            if (idx === 1) secondPointTime = time;
  
            // Fügt den Punkt zum Punkte-Array der Route hinzu
            routeDetails.Punkte.push({
              Name: name,
              StopID: stopID,
              Platform: platform,
              Zeit: time
            });
          });
  
          // Berechnet die Dauer zwischen dem ersten und zweiten Punkt, falls die Dauer noch "N/A" ist und die Zeiten bekannt sind
          if (routeDetails.Dauer === "N/A" && firstPointTime && secondPointTime) {
            const [firstHour, firstMinute] = firstPointTime.split(':').map(Number);
            const [secondHour, secondMinute] = secondPointTime.split(':').map(Number);
            // Berechnet die Dauer in Minuten
            let duration = (secondHour * 60 + secondMinute) - (firstHour * 60 + firstMinute);
            if (duration < 0) { // Über Mitternacht hinweg
              duration += 24 * 60; // Fügt einen Tag hinzu, falls die Dauer negativ ist
            }
            routeDetails.Dauer = `${duration} Minuten`; // Setzt die berechnete Dauer
          }
  
          // Fügt die detaillierte Route zum Routen-Array hinzu
          routes.push(routeDetails);
        });
      });
    } else {
      // Gibt einen Fehler zurück, wenn keine <itdPartialRouteList>-Elemente gefunden wurden
      return JSON.stringify({ error: "Keine itdPartialRouteList gefunden." });
    }
  
    // Gibt das Routen-Array als formatierten JSON-String zurück
    return JSON.stringify(routes, null, 2);
  }
  
  
  