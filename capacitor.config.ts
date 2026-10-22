import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.imako.mikiyas.system',
  appName: 'System for Mikiyas',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    AppBlocker: {}
  }
};

export default config;
