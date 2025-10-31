import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Database } from '@repo/types';

// Load Supabase configuration from environment variables via Expo Constants
// Expo automatically injects EXPO_PUBLIC_* variables at build time via app.json extra field
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "https://your-project-id.supabase.co";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || "your-anon-key";

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  // This might happen during development if the .env file is not set up
  // In a production build, these values are baked in.
  console.warn("Supabase URL/Key not found or is placeholder. Please add to .env file.");
}

export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
