import haltestellen from './assets/data/haltestellen.json'; // Stellen Sie sicher, dass der Pfad korrekt ist
import { parse, differenceInMinutes } from 'date-fns';


// Die findDIVA Funktion, wie zuvor definiert
const findDIVA = (stationText: string): number => {
  const haltestelle = haltestellen.find(h => h.PlatformText === stationText);
  if (haltestelle) {
    return haltestelle.DIVA;
  }
  return 0; // Gibt 0 zurück, wenn keine Haltestelle gefunden wurde
};

// Angepasste xmlAnfrage Funktion, die Namen statt IDs annimmt
export async function xmlAnfrage(originName: string, destinationName: string, date: string, time: string) {
  const baseUrl = "http://www.wienerlinien.at/ogd_routing/XML_TRIP_REQUEST2";
  
  // Ermitteln der DIVA-IDs für die übergebenen Haltestellennamen
  const originStopId = findDIVA(originName);
  const destinationStopId = findDIVA(destinationName);
  
  // Überprüfen, ob für beide Haltestellen gültige DIVA-IDs gefunden wurden
  if (originStopId === 0 || destinationStopId === 0) {
    throw new Error('Eine oder beide Haltestellen wurden nicht gefunden.');
  }
  
  const params = new URLSearchParams({
    type_origin: 'stopID',
    name_origin: originStopId.toString(),
    type_destination: 'stopID',
    name_destination: destinationStopId.toString(),
    itdDate: date,
    itdTime: time,
    outputFormat: 'XML'
  });

  try {
    const response = await fetch(`${baseUrl}?${params}`);
    console.log(`${baseUrl}?${params}`)
    return await response.text();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Wirft den Fehler, damit die aufrufende Komponente ihn behandeln kann
  }
}

// Funktion zum Filtern der itdPoints aus XML
export async function filterItdPointsFromXml(originName: string, destinationName: string, date: string, time: string) {
  try {
    // Rufe die xmlAnfrage-Funktion auf, um die XML-Antwort zu erhalten
    const xmlData = await xmlAnfrage(originName, destinationName, date, time);


    //const itdPoints = extractItdPointsAndPartialRoutes(xmlData);
    //const routing = extractItdPartialRoutes(xmlData);
    const liste = extractItdPartialRouteListToJson(xmlData);
    
    return liste;
    //return itdPoints;
    //return routing;

  } catch (error) {
    console.error('Fehler beim Abrufen der XML-Daten:', error);
    throw error;
  }
}

function extractItdPartialRouteListToJson(xmlData) {
  const itdPartialRouteListRegex = /<itdPartialRouteList>.*?<\/itdPartialRouteList>/gs;
  const itdPartialRouteListMatch = xmlData.match(itdPartialRouteListRegex);
  let routes = [];

  if (itdPartialRouteListMatch) {
    itdPartialRouteListMatch.forEach((partialRouteList) => {
      const itdPartialRouteRegex = /<itdPartialRoute .*?<\/itdPartialRoute>/gs;
      const itdPartialRoutesMatches = partialRouteList.match(itdPartialRouteRegex) || [];
      
      itdPartialRoutesMatches.forEach((route, index) => {
        let routeDetails = {
          Teilroute: index + 1,
          Dauer: "N/A",
          Verkehrsmittel: [],
          Punkte: []
        };

        const transportMatches = route.match(/<itdMeansOfTransport .*?\/>/gs) || [];
        transportMatches.forEach((means) => {
          const attrs = means.match(/(\w+)="([^"]*)"/g).reduce((acc, attr) => {
            const [key, value] = attr.split("=");
            acc[key] = value.replace(/"/g, '');
            return acc;
          }, {});
          
          routeDetails.Verkehrsmittel.push({
            Typ: attrs.type || "N/A",
            Name: attrs.name || "N/A",
            Kurzname: attrs.shortName || "",
            Symbol: attrs.symbol || "",
            Ziel: attrs.destination || "N/A"
          });
        });

        const durationMatch = route.match(/<itdDuration .*?timeMinute="(\d+)"\/>/);
        routeDetails.Dauer = durationMatch ? `${durationMatch[1]} Minuten` : "N/A";

        const pointsMatches = route.match(/<itdPoint .*?<\/itdPoint>/gs) || [];
        let firstPointTime = null;
        let secondPointTime = null;

        pointsMatches.forEach((point, idx) => {
          const name = point.match(/name="([^"]*)"/)?.[1];
          const stopID = point.match(/stopID="([^"]*)"/)?.[1];
          const platform = point.match(/platform="([^"]*)"/)?.[1];

          const timeMatches = point.match(/<itdTime .*?>/g) || [];
          const times = timeMatches.map(time => {
            const hour = time.match(/hour="(\d+)"/)?.[1];
            const minute = time.match(/minute="(\d+)"/)?.[1];
            return hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : null;
          }).filter(time => time !== null && time !== "00:00");

          let time = times.length > 0 ? times[0] : "N/A";

          if (idx === 0) firstPointTime = time;
          if (idx === 1) secondPointTime = time;

          routeDetails.Punkte.push({
            Name: name,
            StopID: stopID,
            Platform: platform,
            Zeit: time
          });
        });

        if (routeDetails.Dauer === "N/A" && firstPointTime && secondPointTime) {
          const [firstHour, firstMinute] = firstPointTime.split(':').map(Number);
          const [secondHour, secondMinute] = secondPointTime.split(':').map(Number);
          let duration = (secondHour * 60 + secondMinute) - (firstHour * 60 + firstMinute);
          if (duration < 0) { // Über Mitternacht hinweg
            duration += 24 * 60;
          }
          routeDetails.Dauer = `${duration} Minuten`;
        }

        routes.push(routeDetails);
      });
    });
  } else {
    return JSON.stringify({ error: "Keine itdPartialRouteList gefunden." });
  }

  return JSON.stringify(routes, null, 2);
}


