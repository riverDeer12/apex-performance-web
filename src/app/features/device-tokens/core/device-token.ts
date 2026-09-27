export class DeviceToken {
  id!: string;
  token!: string;
  username!: string;
  platform!: string;
  appVersion?: string | null;
  buildNumber?: string | null;
  osVersion?: string | null;
  deviceModel?: string | null;
  createdAt!: string;
  updatedAt!: string;
}
