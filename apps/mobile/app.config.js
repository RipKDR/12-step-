// app.config.js allows dynamic configuration based on environment variables
// This file takes precedence over app.json when present
// Expo automatically loads .env files and makes EXPO_PUBLIC_* variables available

export default {
  expo: {
    name: '12-Step Companion',
    slug: 'recovery-companion',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.company.recoverycompanion',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'We use your location to provide helpful actions based on your current location, such as suggesting an Action Plan when you enter a predefined area.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'This app uses your location in the background to trigger helpful Action Plans via geofencing, even when the app is closed.',
        UIBackgroundModes: ['location', 'fetch'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.company.recoverycompanion',
      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-secure-store'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || process.env.EXPO_PROJECT_ID,
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      trpcUrl: process.env.EXPO_PUBLIC_TRPC_URL,
    },
  },
};

