import React, {
  FC,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import {
  PermissionStatus,
  AppPermissions,
  PermissionsContextValue
} from './types';

import {getPermissions, requestPermissions} from './internals';

const defaultPermissionsValue: AppPermissions = {
  exposure: {status: PermissionStatus.Unknown},
  notifications: {status: PermissionStatus.Unknown}
};

const PermissionsContext = createContext<PermissionsContextValue>({
  permissions: defaultPermissionsValue,
  readPermissions: async () => {},
  askPermissions: async () => {}
});

interface PermissionsProviderProps {
  children: React.ReactNode;
  user: any;
}

const PermissionsProvider: FC<PermissionsProviderProps> = ({
  children,
  user
}) => {
  const [permissions, setPermissions] = useState<AppPermissions>(
    defaultPermissionsValue
  );

  const readPermissions = useCallback(async () => {
    console.log('Read permissions...');

    const perms = await getPermissions();
    console.log('perms: ', JSON.stringify(perms, null, 2));

    setPermissions(perms);
  }, []);

  const askPermissions = useCallback(async () => {
    console.log('Requesting permissions...', permissions);
    await requestPermissions(permissions);

    await readPermissions();
  }, []);

  useEffect(() => {
    console.log('initial permissions read');
    readPermissions();
  }, [user, readPermissions]);

  const value: PermissionsContextValue = {
    permissions,
    readPermissions,
    askPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

const usePermissions = () => useContext(PermissionsContext);

export {PermissionsContext, PermissionsProvider, usePermissions};
export * from './types';
