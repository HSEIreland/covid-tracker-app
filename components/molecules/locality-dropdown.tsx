import React, {FC, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {localities} from '../../assets/localities';

import {UserLocation} from '../../providers/context';

import {Separator} from '../atoms/layout';
import {Dropdown} from '../atoms/dropdown';
import {TFunction} from 'i18next';

interface CountyOption {
  label: string;
  value: string;
}

interface LocalityOption extends CountyOption {
  county: string;
}

const countyOptions: CountyOption[] = [];
const map = new Map();
for (const l of localities) {
  if (!map.has(l.county)) {
    map.set(l.county, true);
    countyOptions.push({
      label: l.county,
      value: l.county
    });
  }
}

const localityOptions: LocalityOption[] = localities.map((l) => ({
  label: l.locality,
  value: l.locality,
  county: l.county
}));

interface LocationDropdownProps {
  value: UserLocation;
  onValueChange: (value: UserLocation) => void;
}

const withPreferNotToSay = (t: TFunction, options: any[]): any[] => {
  return [{label: t('common:preferNotToSay'), value: 'u'}, ...options];
};

const normalizeString = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const LocationDropdown: FC<LocationDropdownProps> = ({
  value,
  onValueChange
}) => {
  const {t} = useTranslation();

  const [countyItems, setCountyItems] = useState<CountyOption[]>(
    withPreferNotToSay(t, countyOptions)
  );

  let initialLocalities: LocalityOption[] = [];
  if (value.county) {
    initialLocalities = withPreferNotToSay(
      t,
      localityOptions.filter((l) => l.county === value.county)
    );
  }
  const [countyLocalities, setCountyLocalities] = useState<LocalityOption[]>(
    initialLocalities
  );
  const [localityItems, setLocalityItems] = useState<LocalityOption[]>(
    initialLocalities
  );

  const [countySearch, setCountySearch] = useState<string>('');
  const [localitySearch, setLocalitySearch] = useState<string>('');

  const onCountySearchChanged = (searchTerm: string) => {
    const items = !searchTerm
      ? countyOptions
      : countyOptions.filter((c) =>
          normalizeString(c.value)
            .toLowerCase()
            .includes(normalizeString(searchTerm).toLowerCase())
        );
    setCountyItems(withPreferNotToSay(t, items));

    setCountySearch(searchTerm);
  };

  const onLocalitySearchChanged = (searchTerm: string) => {
    const items = !searchTerm
      ? countyLocalities
      : countyLocalities.filter((l) =>
          normalizeString(l.value)
            .toLowerCase()
            .includes(normalizeString(searchTerm).toLowerCase())
        );
    setLocalityItems(withPreferNotToSay(t, items));

    setLocalitySearch(searchTerm);
  };

  const onCountySelected = (county: string) => {
    if (county === value.county) {
      return;
    }
    const items = localityOptions.filter((l) => l.county === county);
    setCountyLocalities(items);
    setLocalityItems(withPreferNotToSay(t, items));

    onValueChange({county, locality: ''});
  };

  const onLocalitySelected = (locality: string) => {
    onValueChange({...value, locality});
  };

  return (
    <>
      <Dropdown
        label={t('county:label')}
        placeholder={t('county:placeholder')}
        items={countyItems}
        value={value.county}
        onValueChange={onCountySelected}
        search={{
          placeholder: t('county:searchPlaceholder'),
          term: countySearch,
          onChange: onCountySearchChanged,
          noResults: t('county:noResults')
        }}
      />
      {!!value.county && value.county !== 'u' && (
        <>
          <Separator />
          <Dropdown
            label={t('locality:label')}
            placeholder={t('locality:placeholder')}
            items={localityItems}
            value={value.locality}
            onValueChange={onLocalitySelected}
            search={{
              placeholder: t('locality:searchPlaceholder'),
              term: localitySearch,
              onChange: onLocalitySearchChanged,
              noResults: t('locality:noResults')
            }}
          />
        </>
      )}
    </>
  );
};
