import { findDIVA } from './dataModel';

export const xmlAnfrage = async (originName: string, destinationName: string, date: string, time: string): Promise<string> => {
  const baseUrl = "http://www.wienerlinien.at/ogd_routing/XML_TRIP_REQUEST2";
  const originStopId = findDIVA(originName);
  const destinationStopId = findDIVA(destinationName);
  
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
    throw error;
  }
};
