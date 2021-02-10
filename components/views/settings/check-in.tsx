import React, {useState, useRef} from 'react';
import {Text, ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';

import {
  useFocusRef,
  setAccessibilityFocusRef
} from '../../../hooks/accessibility';
import {useDbText} from '../../../providers/settings';
import {useApplication, UserLocation} from '../../../providers/context';

import {Button} from '../../atoms/button';
import {Dropdown} from '../../atoms/dropdown';
import {Spacing, Separator} from '../../atoms/layout';
import {SelectList} from '../../atoms/select-list';
import {Toast} from '../../atoms/toast';
import {LocationDropdown} from '../../molecules/locality-dropdown';

import {text, baseStyles} from '../../../theme';
import {colors} from '../../../constants/colors';
import Layouts from '../../../theme/layouts';

interface ProfileData {
  sex: string;
  ageRange: string;
  location: UserLocation;
  saved: boolean;
}

interface CheckInSettingsProps {
  navigation: any;
}

export const CheckInSettings: React.FC<CheckInSettingsProps> = ({
  navigation
}) => {
  const {t} = useTranslation();
  const app = useApplication();
  const {sexOptions, ageRangeOptions} = useDbText();
  const [toastRef, ref1, ref2, ref3] = useFocusRef({
    accessibilityFocus: false,
    count: 4,
    timeout: 1000
  });
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    sex = '',
    ageRange = '',
    location = {county: '', locality: ''}
  } = app.user!;

  const [profile, setProfile] = useState<ProfileData>({
    sex,
    ageRange,
    location,
    saved: false
  });

  const handleSave = () => {
    const savedProfile = {
      sex: profile.sex,
      ageRange: profile.ageRange,
      location: {
        county: profile.location.county || 'u',
        locality: profile.location.locality || 'u'
      }
    };
    app.setContext({
      user: {
        ...app.user,
        ...savedProfile
      }
    });
    setProfile((s) => ({...s, saved: true, ...savedProfile}));
    scrollViewRef.current?.scrollTo({x: 0, y: 0, animated: true});
  };

  if (!sex || !ageRange || !location.county || !location.locality) {
    return (
      <Layouts.Basic heading={t('checkInSettings:title')}>
        <Text style={text.largeBold}>{t('checkInSettings:checkInFirst')}</Text>
        <Spacing s={48} />
        <Button
          type="empty"
          onPress={() =>
            navigation.navigate('symptoms', {screen: 'symptoms.checker'})
          }>
          {t('checkInSettings:gotoCheckIn')}
        </Button>
      </Layouts.Basic>
    );
  }

  const successToast = profile.saved && (
    <Toast
      ref={toastRef}
      color={colors.toastGreen}
      message={t('common:changesUpdated')}
      icon={require('../../../assets/images/success/green.png')}
    />
  );

  return (
    <Layouts.Scrollable
      toast={successToast}
      heading={t('checkInSettings:title')}
      scrollViewRef={scrollViewRef}>
      <Text style={text.largeBold}>{t('checkInSettings:intro')}</Text>
      <Spacing s={16} />
      <Text style={baseStyles.label}>{t('sex:label')}</Text>
      <Spacing s={8} />
      <SelectList
        items={sexOptions}
        selectedValue={profile.sex}
        onItemSelected={(value) =>
          setProfile({...profile, saved: false, sex: value})
        }
      />
      <Separator />
      <Dropdown
        ref={ref1}
        label={t('ageRange:label')}
        placeholder={t('ageRange:placeholder')}
        items={ageRangeOptions}
        value={profile.ageRange}
        onValueChange={(value) => {
          setProfile({...profile, saved: false, ageRange: value});
          setAccessibilityFocusRef(ref1);
        }}
        onClose={() => setAccessibilityFocusRef(ref1)}
      />
      <Separator />
      <LocationDropdown
        countyRef={ref2}
        localityRef={ref3}
        value={profile.location}
        onValueChange={(value) => {
          setProfile({...profile, saved: false, location: value});
          setAccessibilityFocusRef(value.locality ? ref3 : ref2);
        }}
      />
      <Spacing s={24} />
      <Button
        disabled={
          profile.sex === sex &&
          profile.ageRange === ageRange &&
          profile.location.county === location.county &&
          profile.location.locality === location.locality
        }
        onPress={handleSave}>
        {t('common:confirmChanges')}
      </Button>
    </Layouts.Scrollable>
  );
};
