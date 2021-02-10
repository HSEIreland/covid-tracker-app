import {LEA} from '.';

const subcounties = {
  'Dublin City Council': [
    13260429, // Artane—Whitehall
    13260422, // Ballyfermot—Drimnagh
    13260420, // Ballymun—Finglas
    13260421, // Cabra—Glasnevin
    13260427, // Clontarf
    13260428, // Donaghmede
    13260423, // Kimmage—Rathmines
    13260426, // North Inner City
    13260424, // Pembroke
    13260425, // South East Inner City
    13260430 // South West Inner City
  ],
  'Dún Laoghaire–Rathdown County Council': [
    13260410, // Blackrock
    13260406, // Dundrum
    13260409, // Dún Laoghaire
    13260407, // Glencullen—Sandyford
    13260408, // Killiney—Shankill
    13260405 // Stillorgan
  ],
  'Fingal County Council': [
    13260417, // Balbriggan
    13260402, // Blanchardstown—Mulhuddart
    13260403, // Castleknock
    13260404, // Howth—Malahide
    13260418, // Ongar
    13260400, // Rush—Lusk
    13260401 // Swords
  ],
  'South Dublin County Council': [
    13260416, // Clondalkin
    13260414, // Firhouse—Bohernabreena
    13260411, // Lucan
    13260419, // Palmerstown—Fonthill
    13260413, // Rathfarnham—Templeogue
    13260412, // Tallaght Central
    13260415 // Tallaght South
  ]
} as Record<string, number[]>;

function getLEAs(countyName: string, areas: (LEA | undefined)[]) {
  const sortedAreas = (areas.filter((area) => !!area) as LEA[]).sort((a, b) =>
    a.area < b.area ? -1 : 1
  );

  return {
    name: countyName,
    areas: sortedAreas
  };
}

export function getSubCounties(countyName: string, areas: LEA[]) {
  // Failsafe: on any mismatch between provided data and expected schema, show all county's LEAs
  let dataFitsSchema = true;
  const assignedLeaIds = new Set();
  const getAllLeas = () => [getLEAs(countyName, areas)];

  // Only divide Dublin, other counties have few enough to be managable
  if (!countyName.match(/\bDublin\b/)) {
    return getAllLeas();
  }

  const leasBySubcounty = Object.entries(subcounties).map(
    ([subcountyName, leaIds]) =>
      getLEAs(
        subcountyName,
        leaIds.map((leaId) => {
          const leaArea = areas.find((area) => area.id === `${leaId}`);
          if (leaArea) {
            assignedLeaIds.add(leaId);
          } else {
            dataFitsSchema = false;
          }
          return leaArea;
        })
      )
  );

  if ([...assignedLeaIds].length !== areas.length) {
    dataFitsSchema = false;
  }
  return dataFitsSchema ? leasBySubcounty : getAllLeas();
}
