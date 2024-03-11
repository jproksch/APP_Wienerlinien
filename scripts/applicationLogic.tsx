// Import statements for required modules and functions
import { Alert } from 'react-native'; // Import Alert module from react-native for showing alerts
import { verifyStationExists } from './dataModel'; // Import the verifyStationExists function to check if a station exists

/**
 * Validates the existence of origin and destination stations and proceeds with further actions if both exist.
 * @param {string} originInput The input string for the origin station.
 * @param {string} destinationInput The input string for the destination station.
 */
export const validateAndProceed = async (originInput: string, destinationInput: string) => {
  try {
    // Verifies if the origin station exists using the verifyStationExists function
    const originExists = verifyStationExists(originInput);
    // Verifies if the destination station exists using the verifyStationExists function
    const destinationExists = verifyStationExists(destinationInput);
    
    // Checks if both the origin and destination stations do not exist
    if (!originExists && !destinationExists) {
      // Displays an alert stating that both stations were not found
      Alert.alert("Beide Stationen wurden nicht gefunden");
      // Throws an error indicating that both stations were not found
      throw new Error("Beide Stationen wurden nicht gefunden");
    } else if (!originExists) { // Checks if only the origin station does not exist
      // Displays an alert stating that the origin station was not found
      Alert.alert(`Station ${originInput} wurde nicht gefunden`);
      // Throws an error indicating that the origin station was not found
      throw new Error(`Station ${originInput} wurde nicht gefunden`);
    } else if (!destinationExists) { // Checks if only the destination station does not exist
      // Displays an alert stating that the destination station was not found
      Alert.alert(`Station ${destinationInput} wurde nicht gefunden`);
      // Throws an error indicating that the destination station was not found
      throw new Error(`Station ${destinationInput} wurde nicht gefunden`);
    }
    
    // Logs a message to the console indicating that both stations are verified and the program can proceed
    console.log("Beide Stationen verifiziert, Programm fährt fort.");
    
  } catch (error) { // Catches any errors thrown during the validation process
    // Logs the error message to the console indicating that the validation failed
    console.error("Validierung fehlgeschlagen:", error);
  }
};
