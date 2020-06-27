import {useEffect, useState} from 'react';
import {AppStateStatus, AppState} from 'react-native';

export function useAppState(): [AppStateStatus] {
  const [state, setState] = useState<AppStateStatus>(AppState.currentState);
  const handler = (nextState: AppStateStatus) => {
    setState(nextState);
  };

  useEffect(() => {
    AppState.addEventListener('change', handler);
    return () => {
      AppState.removeEventListener('change', handler);
    };
  }, []);

  return [state];
}
