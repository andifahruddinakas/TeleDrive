import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teledrive.app',
  appName: 'TeleDrive',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
