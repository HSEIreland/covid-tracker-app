import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import {
  loadVaccineCertConfig,
  VaccineCertConfig,
  ValueSet
} from '../../services/api/vaccine-cert';
import {requestWithCache} from '../../services/api/utils';
//import {runRuleSet} from '../../services/rules-runner';
import {VerificationResult} from './types';
import decodeQR from './decode';

interface VaccineCertConfigContextValue {
  loaded: boolean;
  config: VaccineCertConfig | null;
  getValue: (
    valueSet: Record<string, ValueSet>,
    key: string,
    defaultValue?: string
  ) => string;
  verifyCert: (qr: string) => Promise<VerificationResult>;
}

interface VaccineCertConfigProviderProps {
  children: ReactNode;
}

const getValue = (
  valueSet: Record<string, ValueSet>,
  key: string,
  defaultValue: string = key
) => {
  return valueSet[key]?.display || defaultValue;
};

const mapConfig = (c: any): VaccineCertConfig => ({
  ...c,
  valueSets: {
    countryCodes: c.valueSets.countryCodes.valueSetValues,
    diseaseAgentTargeted: c.valueSets.diseaseAgentTargeted.valueSetValues,
    testManf: c.valueSets.testManf.valueSetValues,
    testResult: c.valueSets.testResult.valueSetValues,
    testType: c.valueSets.testType.valueSetValues,
    vaccineMahManf: c.valueSets.vaccineMahManf.valueSetValues,
    vaccineMedicinalProduct: c.valueSets.vaccineMedicinalProduct.valueSetValues,
    vaccineProphylaxis: c.valueSets.vaccineProphylaxis.valueSetValues
  }
});

const defaultSettings: VaccineCertConfigContextValue = {
  loaded: false,
  config: null,
  getValue: () => (null as unknown) as string,
  verifyCert: async () => (null as unknown) as VerificationResult
};

export const VaccineCertConfigContext = createContext<
  VaccineCertConfigContextValue
>(defaultSettings);

export const VaccineCertConfigProvider: FC<VaccineCertConfigProviderProps> = ({
  children
}) => {
  const [state, setState] = useState(defaultSettings);

  useEffect(() => {
    const loadSettingsAsync = async () => {
      const {data} = await requestWithCache('cti.dcc', loadVaccineCertConfig);

      if (data) {
        const config = mapConfig(data);
        console.log(config.certs);

        setState({
          loaded: true,
          config,
          getValue,
          verifyCert: async (qr: string) => {
            const {cert, error} = await decodeQR(qr, config.certs);

            if (!cert) {
              return {error};
            }

            //const ruleset = config.rules.IE;
            const ruleErrors: string[] = [];

            /*const results = runRuleSet(ruleset, {
              payload: cert,
              external: {
                valueSets: config.valuesetsComputed,
                validationClock: new Date().toISOString()
              }
            });

            if (results && !results.allSatisfied) {
              Object.keys(results?.ruleEvaluations || {}).forEach(
                (ruleId) => {
                  if (!results?.ruleEvaluations[ruleId]) {
                    const rule = ruleset.find((r) => r.id === ruleId);
                    ruleErrors.push(rule!.description);
                  }
                }
              );
            }*/

            return {cert, ruleErrors, error};
          }
        });
      }
    };

    loadSettingsAsync();
  }, [setState]);

  return (
    <VaccineCertConfigContext.Provider value={state}>
      {children}
    </VaccineCertConfigContext.Provider>
  );
};

export const useVaccineCertConfig = () => useContext(VaccineCertConfigContext);
