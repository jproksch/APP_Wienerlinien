import haltestellen from '../assets/data/haltestellen.json';

type GPSData = [number, number];


export const verifyStationExists = (stationText: string): boolean => {
  const haltestelle = haltestellen.find(h => h.PlatformText === stationText);
  return !!haltestelle;
};

export const getGPSDataFromStopName = (stationText: string): GPSData | null => {
  const haltestelle = haltestellen.find(h => h.PlatformText === stationText);
  if (haltestelle) {
    return [haltestelle.Longitude, haltestelle.Latitude];
  }
  return null;
};

export const findDIVA = (stationText: string): number => {
  const haltestelle = haltestellen.find(h => h.PlatformText === stationText);
  if (haltestelle) {
    return haltestelle.DIVA;
  }
  return 0;
};