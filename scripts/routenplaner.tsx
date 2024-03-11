// Importieren Sie das Modul zur Arbeit mit JSON-Daten, das Haltestelleninformationen enthält
import haltestellen from '../assets/data/haltestellen.json';
// Importieren Sie die benötigten Funktionen aus dem `date-fns` Paket
import { parse, differenceInMinutes, weeksToDays } from 'date-fns';
import { Alert} from 'react-native';
import { xmlAnfrage } from './apiRequests';
import {extractItdPartialRouteListToJsonString} from './xmlProcessing';
import {getRoute} from './routenModel';
import {entWienern,extractStationsFromRoutes,GPSData,getGPSDataFromStopName} from './dataModel';

/**
 * Extrahiert Routeninformationen aus einer XML-Antwort.
 * @param {string} originName - Name der Startstation
 * @param {string} destinationName - Name der Zielstation
 * @param {string} date - Datum der Abfahrt
 * @param {string} time - Zeit der Abfahrt
 * @returns {Promise<string>} - Ein Promise, das beim Erfolg die Routeninformationen als JSON-String und die GPSDaten zurückgibt
 */
export async function filterItdPointsFromXml(originName: string, destinationName: string, date: string, time: string): Promise<[string, GPSData[]]> {
  try {
    let stationen = [];
    let gpsLocation: GPSData[] = [];
    const werte = await extractItdPartialRouteListToJsonString(await xmlAnfrage(originName, destinationName, date, time));
    let routeSummary = "";
    if (werte.length > 0) {
      //console.log("Hier"+werte[0]);
      routeSummary = getRoute(werte[0]);
      stationen = extractStationsFromRoutes(werte[0]);
      stationen.forEach(element => {
        gpsLocation.push(getGPSDataFromStopName(entWienern(element))); 
      });
    }
    
    return [routeSummary, gpsLocation];
  } catch (error) {
    console.error('Fehler beim Abrufen der XML-Daten:', error);
    throw error; // Oder gib eine benutzerfreundliche Fehlermeldung zurück
  }
}