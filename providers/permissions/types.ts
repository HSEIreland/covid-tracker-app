export enum PermissionStatus {
  Unknown = 'unknown',
  NotAvailable = 'not_available',
  Allowed = 'allowed',
  NotAllowed = 'not_allowed'
}

interface PermissionDetails {
  status:
    | PermissionStatus.Unknown
    | PermissionStatus.NotAvailable
    | PermissionStatus.NotAllowed
    | PermissionStatus.Allowed;
  internal?: any;
}

export interface AppPermissions {
  exposure: PermissionDetails;
  notifications: PermissionDetails;
}

export interface PermissionsContextValue {
  permissions: AppPermissions;
  readPermissions: () => Promise<void>;
  askPermissions: () => Promise<void>;
}
