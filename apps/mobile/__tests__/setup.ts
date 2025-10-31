/**
 * Test Setup File
 * Configures testing environment for mobile app tests
 */

import '@testing-library/react-native/extend-expect';

// Mock expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSegments: () => [],
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
  })),
}));

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelNotificationAsync: jest.fn(),
}));

// Mock tRPC
jest.mock('../../lib/trpc', () => ({
  trpc: {
    users: {
      getProfile: {
        useQuery: jest.fn(() => ({ data: null, isLoading: false })),
      },
    },
    daily: {
      getByDate: {
        useQuery: jest.fn(() => ({ data: null, isLoading: false })),
      },
      upsert: {
        useMutation: jest.fn(() => ({
          mutateAsync: jest.fn(),
        })),
      },
    },
  },
}));

