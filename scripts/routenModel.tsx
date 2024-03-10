interface Verkehrsmittel {
  Typ: string;
  Name: string;
  Kurzname: string;
  Symbol: string;
  Ziel: string;
}

interface Punkt {
  Name: string;
  StopID: string;
  Platform: string;
  Zeit: string;
}

interface Route {
  Teilroute: number;
  Dauer: string;
  Verkehrsmittel: Verkehrsmittel[];
  Punkte: Punkt[];
}

interface GanzeRoute {

  teilRoute : Route[];

}

interface RoutenPlan {

  routen:GanzeRoute[];

}


export function getRoute(data) {
  const dataArray = JSON.parse(data);

  const routenPlan = dataArray.reduce((acc, route, index, arr) => {
    if (route.Teilroute === 1) {
      // Finde den Index des nächsten Starts einer Teilroute
      const nextStartIndex = arr.findIndex((r, i) => i > index && r.Teilroute === 1);
      // Schneide das Array bis zum nächsten Start (oder bis zum Ende, falls kein weiterer Start existiert)
      const teilRoute = arr.slice(index, nextStartIndex < 0 ? undefined : nextStartIndex);
      acc.routen.push({ teilRoute });
    }
    return acc;
  }, { routen: [] });
  console.log(routenPlan);
  return routenPlanToString(routenPlan);
}

export function routenPlanToString({ routen }) {
  return routen.map((ganzeRoute, index) => 
    `\nRoute ${index + 1}:\n${ganzeRouteToString(ganzeRoute)}---\n`
  ).join('');
}

function ganzeRouteToString({ teilRoute }) {
  return teilRoute.map((route, index) => {
    const verkehrsmittelDetails = route.Verkehrsmittel.map(vm => 
      `Verkehrsmittel: ${vm.Typ}, Name: ${vm.Name}, Kurzname: ${vm.Kurzname}, Symbol: ${vm.Symbol}, Ziel: ${vm.Ziel}`
    ).join('\n');

    const punkteDetails = route.Punkte.map(punkt => 
      `Punkt: ${punkt.Name}, StopID: ${punkt.StopID}, Platform: ${punkt.Platform}, Zeit: ${punkt.Zeit}`
    ).join('\n');

    return `Teilroute ${index + 1}:\nDauer: ${route.Dauer}\n${verkehrsmittelDetails}\n${punkteDetails}\n`;
  }).join('\n');
}