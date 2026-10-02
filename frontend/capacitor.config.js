const config = {
  appId: 'com.sams.laundry',
  appName: 'SAMB\'s Laundry',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#2563eb",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true
    },
    StatusBar: {
      style: 'LIGHT',
      color: '#2563eb'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    Camera: {
      permissions: ["camera", "photos"]
    },
    Geolocation: {
      permissions: ["location"]
    },
    Share: {
      permissions: ["share"]
    },
    Vibration: {
      permissions: ["vibration"]
    },
    Network: {
      permissions: ["network"]
    },
    Haptics: {
      permissions: ["haptics"]
    }
  },
  iOS: {
    scheme: 'SAMBsLaundry'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

module.exports = config;
