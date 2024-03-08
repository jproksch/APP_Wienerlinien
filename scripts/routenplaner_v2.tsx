// Importieren Sie das Modul zur Arbeit mit JSON-Daten, das Haltestelleninformationen enthält
import haltestellen from '../assets/data/haltestellen.json';
// Importieren Sie die benötigten Funktionen aus dem `date-fns` Paket
import { parse, differenceInMinutes } from 'date-fns';
import { Alert} from 'react-native';
import { xmlAnfrage } from './apiRequests';
import {extractItdPartialRouteListToJson} from './xmlProcessing'


/**
 * Extrahiert Routeninformationen aus einer XML-Antwort.
 * @param {string} originName - Name der Startstation
 * @param {string} destinationName - Name der Zielstation
 * @param {string} date - Datum der Abfahrt
 * @param {string} time - Zeit der Abfahrt
 * @returns {Promise<string>} - Ein Promise, das beim Erfolg die Routeninformationen als JSON-String zurückgibt
 */
export async function filterItdPointsFromXml(originName: string, destinationName: string, date: string, time: string): Promise<string> {
  try {
    // XML-Daten von der API abrufen

    const liste = extractItdPartialRouteListToJson(await xmlAnfrage(originName, destinationName, date, time));

    return liste;
  } catch (error) {
    console.error('Fehler beim Abrufen der XML-Daten:', error);
    throw error;
  }
}

