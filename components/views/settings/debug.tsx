import React, {useState, useEffect, useCallback} from 'react';
import {
  NativeEventEmitter,
  ScrollView,
  Text,
  View,
  Alert,
  StyleSheet
} from 'react-native';
import {format} from 'date-fns';
import ExposureNotification, {
  useExposure,
  getConfigData,
  CloseContact
} from 'react-native-exposure-notification-service';

import {Button} from '../../atoms/button';

import Layouts from '../../../theme/layouts';
import {useApplication} from '../../../providers/context';
import * as SecureStore from 'expo-secure-store';
import {useCheckinReminder} from '../../../providers/reminders/checkin-reminder';
import {usePause} from '../../../providers/reminders/pause-reminder';
import {useExposureReminder} from '../../../providers/reminders/exposure-reminder';
import {useCaseReminder} from '../../../providers/reminders/case-reminder';
import {ReminderState} from '../../../providers/reminders/reminder';
//import {showRiskyVenueNotification} from '../../../venue-check-in';

const emitter = new NativeEventEmitter(ExposureNotification);

type StateData = null | Record<string, any>;
interface DebugEvent {
  status?: any;
  scheduledTask?: any;
}

export const Debug = () => {
  const exposure = useExposure();
  const app = useApplication();
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [contacts, setContacts] = useState<CloseContact[]>([]);
  const [logData, setLogData] = useState<StateData>(null);
  const [configData, setConfigData] = useState<StateData>(null);
  const [appData, setAppData] = useState<StateData>(null);

  const loadData = useCallback(async () => {
    const newContacts = await exposure.getCloseContacts();
    const config = await getConfigData();
    const newLogData = await exposure.getLogData();
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const authToken = await SecureStore.getItemAsync('token');
    const appInfo = {
      userValid: app.user?.valid,
      onboarded: app.completedExposureOnboarding,
      refreshToken,
      authToken
    };
    setAppData(appInfo);
    const runDates = newLogData.lastRun;
    if (runDates && typeof runDates === 'string') {
      const dates = runDates
        .replace(/^,/, '')
        .split(',')
        .map((d) => {
          return format(parseInt(d, 10), 'dd/MM HH:mm:ss');
        });
      newLogData.lastRun = dates.join(', ');
    } else {
      newLogData.lastRun
        ? format(newLogData.lastRun, 'dd/MM HH:mm:ss')
        : 'Unknown';
    }

    setLogData(newLogData);
    setConfigData(config);
    console.log('logdata', newLogData);
    console.log(
      'has api message',
      Boolean(newLogData.lastApiError && newLogData.lastApiError.length)
    );

    setContacts(newContacts);
    console.log('contacts', newContacts);
  }, [setLogData, setContacts]);

  const checkinReminder = useCheckinReminder();
  const pauseReminder = usePause();
  const exposureReminder = useExposureReminder();
  const caseReminder = useCaseReminder();

  const getReminderDebugInfo = (rs: Partial<ReminderState>) => ({
    active: rs.active,
    timestamp: rs.timestamp,
    readable_time: rs.timestamp ? format(rs.timestamp, 'dd/MMM HH:mm:ss') : ''
  });

  const reminderDebugInfo = {
    checkin: getReminderDebugInfo(checkinReminder),
    pause: getReminderDebugInfo(pauseReminder),
    exposure: {
      reminder: getReminderDebugInfo(exposureReminder.exposureReminderState),
      restrictionEnd: getReminderDebugInfo(exposureReminder.restrictionEndState)
    },
    case: {
      reminder: getReminderDebugInfo(caseReminder.caseReminderState)
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleEvent(ev: DebugEvent = {}) {
    events.push(ev);
    setEvents([...events]);
  }

  const checkExposure = async () => {
    try {
      setEvents([]);
      subscription.remove();
      emitter.removeListener('exposureEvent', handleEvent);
    } catch (e) {}
    let subscription = emitter.addListener('exposureEvent', handleEvent);
    await exposure.checkExposure(true);
  };

  useEffect(() => {
    function handleSilentEvent(ev: Record<string, any>) {
      if (ev.exposure || (ev.info && ev.info.includes('saveDailyMetric'))) {
        loadData();
      }
    }

    let subscription = emitter.addListener('exposureEvent', handleSilentEvent);

    return () => {
      try {
        subscription.remove();
      } catch (e) {
        console.log('Remove error', e);
      }
    };
  }, []);

  const simulateExposure = async () => {
    exposure.simulateExposure(3, 6);
  };

  const deleteAllData = async () => {
    Alert.alert('Delete Data', 'Are you asure you want to delete all data.', [
      {
        text: 'No',
        onPress: () => console.log('No Pressed'),
        style: 'cancel'
      },
      {
        text: 'Yes',
        onPress: async () => {
          await exposure.deleteAllData();
          setEvents([]);
          setContacts([]);
          setLogData(null);
          setAppData(null);
          setConfigData(null);
          await exposure.configure(); // reconfigure as delete all deletes sharedprefs on android
        },
        style: 'cancel'
      }
    ]);
  };

  /*
  const checkRiskyVenues = () => {
    showRiskyVenueNotification();
  };
  */

  const simulateUpload = () => {
    app.setContext({uploadDate: Date.now()});
  };

  const displayContact = (contact: CloseContact) => {
    const displayData = [
      `Alert: ${format(contact.exposureAlertDate, 'dd/MM HH:mm')}`,
      `Contact: ${format(contact.exposureDate, 'dd/MM')}`,
      `Score: ${contact.maxRiskScore}`,
      `Keys: ${contact.matchedKeyCount}`,
      `Durations: ${contact.attenuationDurations}`,
      `maximumRiskScoreFullRange: ${contact.maxRiskScoreFullRange}`,
      `riskScoreSumFullRange: ${contact.riskScoreSumFullRange}`
    ];

    if (contact.windows) {
      contact.windows.forEach((d) => {
        displayData.push(`When: ${format(d.date, 'dd/MM')}`);
        displayData.push(`calibrationConfidence: ${d.calibrationConfidence}`);
        displayData.push(`diagnosisReportType: ${d.diagnosisReportType}`);
        displayData.push(`infectiousness: ${d.infectiousness}`);
        displayData.push(`buckets: ${d.buckets}`);
        displayData.push(`weightedBuckets: ${d.weightedBuckets}`);
        displayData.push(`numScans: ${d.numScans}`);
        displayData.push(`exceedsThreshold: ${d.exceedsThreshold}`);
      });
    }
    Alert.alert('Exposure Details', displayData.join('\n'), [
      {
        text: 'OK',
        onPress: () => console.log('OK Pressed'),
        style: 'cancel'
      }
    ]);
  };

  const listContactInfo = (contact: CloseContact) => {
    return `Alert: ${format(
      contact.exposureAlertDate,
      'dd/MM HH:mm'
    )}, Contact: ${format(contact.exposureDate, 'dd/MM')}, Score: ${
      contact.maxRiskScore
    }, Keys: ${contact.matchedKeyCount} ${contact.windows ? ', *' : ''}`;
  };

  return (
    <Layouts.Basic heading="Debug">
      <ScrollView>
        <Button type="danger" onPress={checkExposure}>
          Check Exposure
        </Button>
        <Button type="danger" onPress={simulateExposure}>
          Simulate Exposure
        </Button>
        <Button type="danger" onPress={simulateUpload}>
          Simulate Upload Keys
        </Button>
        <Button type="danger" onPress={deleteAllData}>
          Delete All Data
        </Button>
        {/*<Button type="default" onPress={checkRiskyVenues}>
          Check Risky Venues
        </Button>*/}
        {logData && (
          <View style={styles.logScroll}>
            <ScrollView
              style={styles.contactsScroll}
              nestedScrollEnabled={true}>
              {logData.installedPlayServicesVersion > 0 && (
                <Text>
                  Play Services Version: {logData.installedPlayServicesVersion}
                </Text>
              )}
              {logData.nearbyApiSupported === true ||
                (logData.nearbyApiSupported === false && (
                  <Text>
                    Exposure API Supported: {`${logData.nearbyApiSupported}`}
                  </Text>
                ))}
              {<Text>Last Index: {logData.lastIndex}</Text>}
              {<Text>Last Ran: {logData.lastRun}</Text>}
              {Boolean(logData.lastError && logData.lastError.length) && (
                <Text selectable={true}>
                  Last Message: {`${logData.lastError}`}
                </Text>
              )}
              {Boolean(logData.lastApiError && logData.lastApiError.length) && (
                <Text selectable={true}>
                  Last Exposure API Error: {`${logData.lastApiError}`}
                </Text>
              )}
            </ScrollView>
          </View>
        )}
        {appData && (
          <>
            <View style={styles.contacts}>
              <Text selectable={true} style={styles.title}>
                App Config
              </Text>
            </View>
            <ScrollView style={styles.appInfo} nestedScrollEnabled={true}>
              <Text selectable={true}>{JSON.stringify(appData, null, 2)}</Text>
            </ScrollView>
          </>
        )}
        {configData && (
          <>
            <View style={styles.contacts}>
              <Text selectable={true} style={styles.title}>
                Module Config
              </Text>
            </View>
            <ScrollView style={styles.appInfo} nestedScrollEnabled={true}>
              <Text selectable={true}>
                {JSON.stringify(configData, null, 2)}
              </Text>
            </ScrollView>
          </>
        )}
        <View style={styles.contacts}>
          <Text selectable={true} style={styles.title}>
            Reminders
          </Text>
        </View>
        <ScrollView style={styles.appInfo} nestedScrollEnabled={true}>
          <Text selectable={true}>
            {JSON.stringify(reminderDebugInfo, null, 2)}
          </Text>
        </ScrollView>
        <View style={styles.contacts}>
          <Text style={styles.title}>Contacts</Text>
        </View>
        <ScrollView style={styles.contactInfo} nestedScrollEnabled={true}>
          {contacts &&
            contacts.map((c, index) => (
              <Text
                key={index}
                style={styles.row}
                onPress={() => displayContact(c)}>
                {listContactInfo(c)}
              </Text>
            ))}
        </ScrollView>
        <View style={styles.contacts}>
          <Text selectable={true} style={styles.title}>
            Logs
          </Text>
        </View>
        <ScrollView style={styles.eventsScroll} nestedScrollEnabled={true}>
          <Text selectable={true}>{JSON.stringify(events, null, 2)}</Text>
        </ScrollView>
      </ScrollView>
    </Layouts.Basic>
  );
};

const styles = StyleSheet.create({
  stats: {
    marginTop: 24,
    paddingTop: 8,
    borderTopWidth: 1
  },
  contacts: {
    marginTop: 12,
    borderTopWidth: 1
  },
  appInfo: {
    height: 200
  },
  logScroll: {
    height: 150
  },
  contactInfo: {
    height: 100
  },
  eventsScroll: {
    height: 450
  },
  contactsScroll: {
    height: 100
  },
  title: {
    fontSize: 24,
    marginBottom: 12
  },
  row: {
    height: 28
  }
});
