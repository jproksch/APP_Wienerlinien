import React from "react";
import haltestellen from './assets/data/haltestellen.json'; // Stellen Sie sicher, dass der Pfad korrekt ist
import { xml2js } from 'xml-js';

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

    // Extrahiere die itdPoint-Elemente aus der XML-Antwort
    const itdPoints = extractItdPointsAndPartialRoutes(xmlData);

    return itdPoints;
  } catch (error) {
    console.error('Fehler beim Abrufen der XML-Daten:', error);
    throw error;
  }
}

function extractItdPointsAndPartialRoutes(xmlData: string): string {
  const itdPointRegex = /<itdPoint .*?<\/itdPoint>/gs;

  const itdPointsMatches = xmlData.match(itdPointRegex) || [];
  let routes = [];
  let currentRoute = [];
  let currentStopId = '';

  itdPointsMatches.forEach((point, index) => {
    const nameMatch = point.match(/name="([^"]+)"/);
    const stopIDMatch = point.match(/stopID="([^"]+)"/);
    const areaMatch = point.match(/area="([^"]+)"/);

    const name = nameMatch ? nameMatch[1] : 'Unbekannt';
    const stopID = stopIDMatch ? stopIDMatch[1] : 'Unbekannt';
    const area = areaMatch ? areaMatch[1] : 'Unbekannt';

    // Wenn es der erste Punkt ist oder eine Wiederholung des StopID (neue Route startet)
    if (index === 0 || stopID === currentStopId) {
      if (currentRoute.length > 0) {
        routes.push([...currentRoute]); // Beende die aktuelle Route und speichere sie
      }
      currentRoute = []; // Starte eine neue Route
    }

    // Füge den Punkt zur aktuellen Route hinzu
    currentRoute.push({ name, stopID, area });

    // Aktualisiere currentStopId mit dem StopID dieses Punkts für die nächste Iteration
    currentStopId = stopID;

    // Wenn es der letzte Punkt ist, schließe die aktuelle Route ab
    if (index === itdPointsMatches.length - 1) {
      routes.push([...currentRoute]);
    }
  });

  // Erstelle eine Ausgabe für jede Route
  let output = routes.map((route, routeIndex) => {
    const start = `Route ${routeIndex + 1}: Start bei ${route[0].name} (StopID: ${route[0].stopID}, Area: ${route[0].area})`;
    const stops = route
      .slice(1) // Ignoriere den Startpunkt für Zwischenstationen
      .filter((point, index, self) =>
        self.findIndex(p => p.stopID === point.stopID) === index // Filtere Duplikate heraus
      )
      .map(point => `  Zwischenstation: ${point.name} (StopID: ${point.stopID}, Area: ${point.area})`)
      .join('\n');
    const end = route.length > 1 ? `Route ${routeIndex + 1}: Endet bei ${route[route.length - 1].name} (StopID: ${route[route.length - 1].stopID}, Area: ${route[route.length - 1].area})` : '';

    return [start, stops, end].filter(part => part.trim()).join('\n');
  }).join('\n\n');

  return `Extrahierte Routen:\n${output}`;
}


