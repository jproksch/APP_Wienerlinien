import { Alert } from 'react-native';
import { verifyStationExists } from './dataModel';
import { xmlAnfrage } from './apiRequests';

export const validateAndProceed = async (originInput: string, destinationInput: string) => {
  try {
    const originExists = verifyStationExists(originInput);
    const destinationExists = verifyStationExists(destinationInput);
    
    if (!originExists && !destinationExists) {
      Alert.alert("Beide Stationen wurden nicht gefunden");
      throw new Error("Beide Stationen wurden nicht gefunden");
    } else if (!originExists) {
      Alert.alert(`Station ${originInput} wurde nicht gefunden`);
      throw new Error(`Station ${originInput} wurde nicht gefunden`);
    } else if (!destinationExists) {
      Alert.alert(`Station ${destinationInput} wurde nicht gefunden`);
      throw new Error(`Station ${destinationInput} wurde nicht gefunden`);
    }
    
    console.log("Beide Stationen verifiziert, Programm fährt fort.");
    
  } catch (error) {
    console.error("Validierung fehlgeschlagen:", error);
  }
};
