// Use these as symptom question identifiers by question number after version 1.0.5
export const symptoms = ['fever', 'cough', 'breath', 'flu'] as const;
export const getSymptomId = (question: number) => symptoms[question - 1];
export type Symptoms = Record<typeof symptoms[number], 0 | 1>;

// Legacy support: Versions 1.0.0-1.0.5 saved a translated symptom id.
// These are possible values that may have been saved in old user checker history.
// > v1.0.5 fixed values above are used, no need to update below with new translations.
const symptomIdTranslations = {
  fever: [
    'fever',
    'الحمى',
    'fièvre',
    'fiabhras',
    'karščiavimas',
    'drudzis',
    'gorączka',
    'febre'
  ],
  cough: [
    'cough',
    'السعال',
    'toux',
    'casacht',
    'kosulys',
    'klepus',
    'kaszel',
    'tosse'
  ],
  breath: [
    'breath',
    'التنفس',
    'resp.',
    'anáil',
    'kvėpavimas',
    'elpa',
    'oddech',
    'resp.'
  ],
  flu: [
    'flu',
    'الإنفلونزا',
    'grippe',
    'fliú',
    'gripas',
    'gripa',
    'grypa',
    'gripe'
  ]
};

// Gets a valid Symptom ID from an old potentially translated saved ID
export const getLegacySymptomId = (id: string) => {
  if (symptomIdTranslations.hasOwnProperty(id)) {
    return id;
  }

  // We need to tell Typescript that Object.keys returns only this object's keys
  const keys = Object.keys(
    symptomIdTranslations
  ) as (keyof typeof symptomIdTranslations)[];

  return keys.find((key) => symptomIdTranslations[key].includes(id));
};

// Turns an old stored Symptoms object into a clean one without translated IDs
export const fixLegacySymptoms = (legacySymptoms: Record<string, 0 | 1>) =>
  Object.entries(legacySymptoms).reduce(
    (fixedSymptoms, [symptomId, value]) => ({
      ...fixedSymptoms,
      [getLegacySymptomId(symptomId) || '']: value
    }),
    {} as Symptoms
  );
