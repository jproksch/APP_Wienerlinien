// Importing the JSON data containing station information
import haltestellen from '../assets/data/haltestellen.json';

// Type definition for GPS data, representing a tuple of longitude and latitude
export type GPSData = [number, number];

/**
 * Checks if a station exists in the dataset based on the provided station name.
 * @param {string} stationText The name of the station to search for.
 * @returns {boolean} Returns true if the station exists, otherwise false.
 */
export const verifyStationExists = (stationText: string): boolean => {
  // Searches for a station in the dataset that matches the provided name
  const haltestelle = haltestellen.find(h => h.PlatformText === stationText);
  // Returns true if a station is found, otherwise false
  return !!haltestelle;
};

/**
 * Retrieves the GPS data for a station based on the provided station name.
 * @param {string} stationText The name of the station to search for.
 * @returns {GPSData | null} Returns the GPS coordinates if the station is found, otherwise null.
 */
export const getGPSDataFromStopName = (stationText: string): GPSData | null => {
  // Searches for a station in the dataset that matches the provided name
  const haltestelle = haltestellen.find(h => h.PlatformText === stationText);
  if (haltestelle) {
    // Returns the longitude and latitude if the station is found
    return [haltestelle.Longitude, haltestelle.Latitude];
  }
  // Returns null if no station is found
  return null;
};

/**
 * Finds the DIVA number for a station based on the provided station name.
 * @param {string} stationText The name of the station to search for.
 * @returns {number} Returns the DIVA number if the station is found, otherwise 0.
 */
export const findDIVA = (stationText: string): number => {
  // Searches for a station in the dataset that matches the provided name
  const haltestelle = haltestellen.find(h => h.PlatformText === stationText);
  if (haltestelle) {
    // Returns the DIVA number if the station is found
    return haltestelle.DIVA;
  }
  // Returns 0 if no station is found
  return 0;
};

/**
 * Removes the prefix "Wien " from the station name if present.
 * @param {string} stationText The name of the station.
 * @returns {string} Returns the station name without the "Wien " prefix.
 */
export function entWienern(stationText: string): string {
  // Checks if the station name starts with "Wien "
  if (stationText.startsWith("Wien ")) {
      // Removes the "Wien " prefix and returns the modified station name
      return stationText.substring(5); // Removes the first 5 characters ("Wien ")
  }
  // Returns the original station name if it doesn't start with "Wien "
  return stationText;
}

// Note: The 'arrayValueCleaner' function is declared but not implemented, hence no comments added.

/**
 * Extracts and returns a list of unique station names from a JSON string containing route information.
 * @param {string} jsonString The JSON string containing route data.
 * @returns {Array<string> | string} Returns an array of unique station names, or an error message if parsing fails.
 */
export function extractStationsFromRoutes(jsonString):string[] {
  try {
    // Parses the JSON string into an object
    const routes = JSON.parse(jsonString);
    
    // Initializes an array to store unique station names
    let stations = [];

    // Iterates over each route in the parsed object
    routes.forEach(route => {
      // Iterates over each point in the route
      route.Punkte.forEach(point => {
        // Adds the station name to the list if it's not already included
        if (!stations.includes(point.Name)) {
          stations.push(point.Name);
        }
      });
    });

    // Returns the list of unique station names
    return stations;
  } catch (e) {
    // Returns an error message if JSON parsing fails
    return [`Fehler beim Parsen des JSON-Strings: ${e.message}`];
  }
}
