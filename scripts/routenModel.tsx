// Represents a mode of transportation, including its type, name, abbreviation, symbol, and destination.
interface Verkehrsmittel {
  Typ: string;
  Name: string;
  Kurzname: string;
  Symbol: string;
  Ziel: string;
}

// Represents a stop or point along a route, including its name, ID, platform, and time.
interface Punkt {
  Name: string;
  StopID: string;
  Platform: string;
  Zeit: string;
}

// Represents a segment of a route, including its sequence number, duration, modes of transportation used, and points or stops.
interface Route {
  Teilroute: number;
  Dauer: string;
  Verkehrsmittel: Verkehrsmittel[];
  Punkte: Punkt[];
}

// Represents a complete route, which is a collection of route segments.
interface GanzeRoute {
  teilRoute: Route[];
}

// Represents a plan of routes, containing multiple complete routes.
export interface RoutenPlan {
  routen: GanzeRoute[];
}

/**
 * Parses the given JSON string to create a route plan and converts it into a string representation.
 * @param {string} data - The JSON string containing route data.
 * @returns {string} A string representation of the route plan.
 */
export function getRoute(data) {
  // Parses the JSON input data into an array.
  const dataArray = JSON.parse(data);

  // Reduces the array into a routenPlan object, grouping route segments into complete routes.
  const routenPlan = dataArray.reduce((acc, route, index, arr) => {
    if (route.Teilroute === 1) {
      // Finds the index of the next starting route segment in the array.
      const nextStartIndex = arr.findIndex((r, i) => i > index && r.Teilroute === 1);
      // Slices the array to group segments of a complete route.
      const teilRoute = arr.slice(index, nextStartIndex < 0 ? undefined : nextStartIndex);
      // Adds the grouped segments as a complete route to the accumulator.
      acc.routen.push({ teilRoute });
    }
    return acc;
  }, { routen: [] }); // Initial accumulator with an empty routen array.

  // Converts the routenPlan object to a string representation.
  return routenPlanToString(routenPlan);
}

/**
 * Converts a routenPlan object to a string representation, detailing each route and its segments.
 * @param {RoutenPlan} routenPlan - The routenPlan object containing all routes to be represented as a string.
 * @returns {string} A string representation of the routenPlan, detailing each route and its segments.
 */
export function routenPlanToString({ routen }) {
  // Maps each complete route to a string, detailing each route and its segments.
  return routen.map((ganzeRoute, index) => 
    `\nRoute ${index + 1}:\n${ganzeRouteToString(ganzeRoute)}---\n`
  ).join('');
}

/**
 * Converts a single GanzeRoute object to a string representation, detailing each segment of the route.
 * @param {GanzeRoute} ganzeRoute - The GanzeRoute object to be converted to a string representation.
 * @returns {string} A string representation of the GanzeRoute, detailing each segment, its duration, transport modes, and points.
 */
function ganzeRouteToString({ teilRoute }) {
  // Maps each route segment to a string, detailing the segment and its transportation modes and points.
  return teilRoute.map((route, index) => {
    // Maps each transportation mode to a string.
    const verkehrsmittelDetails = route.Verkehrsmittel.map(vm => 
      `Verkehrsmittel: ${vm.Typ}, Name: ${vm.Name}, Kurzname: ${vm.Kurzname}, Symbol: ${vm.Symbol}, Ziel: ${vm.Ziel}`
    ).join('\n');

    // Maps each point to a string.
    const punkteDetails = route.Punkte.map(punkt => 
      `Punkt: ${punkt.Name}, StopID: ${punkt.StopID}, Platform: ${punkt.Platform}, Zeit: ${punkt.Zeit}`
    ).join('\n');

    // Combines the details of a route segment into a single string.
    return `Teilroute ${index + 1}:\nDauer: ${route.Dauer}\n${verkehrsmittelDetails}\n${punkteDetails}\n`;
  }).join('\n');
}
