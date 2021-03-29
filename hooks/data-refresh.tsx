import {useCallback, useEffect, useState} from 'react';
import {useApplication} from '../providers/context';

export const useDataRefresh = () => {
  const {data, loadAppData, user} = useApplication();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppData().then(() => setRefreshing(false));
  }, [loadAppData]);

  const shouldLoadData = user && !data && !refreshing;
  useEffect(() => {
    if (shouldLoadData) {
      onRefresh();
    }
  }, [shouldLoadData, onRefresh]);

  return {refreshing, onRefresh};
};
