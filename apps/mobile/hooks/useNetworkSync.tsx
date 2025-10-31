import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { startBackgroundSync, stopBackgroundSync, forceSyncNow } from '../lib/sync';

/**
 * Hook to manage network-based sync for offline-first functionality
 * Monitors network state and app state to trigger syncs when appropriate
 */
export function useNetworkSync(userId: string | null): void {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isOnlineRef = useRef<boolean>(true);

  useEffect(() => {
    if (!userId) {
      // Stop sync if no user
      stopBackgroundSync();
      return;
    }

    // Initial network state check
    NetInfo.fetch().then((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      isOnlineRef.current = isConnected;
      
      if (isConnected) {
        console.log('Network connected, starting sync...');
        startBackgroundSync(userId);
      } else {
        console.log('Network disconnected, stopping sync...');
        stopBackgroundSync();
      }
    });

    // Subscribe to network state changes
    const unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      const wasOnline = isOnlineRef.current;
      isOnlineRef.current = isConnected;

      if (isConnected && !wasOnline) {
        // Network just came back online
        console.log('Network reconnected, starting sync...');
        startBackgroundSync(userId);
        // Force immediate sync when reconnecting
        forceSyncNow(userId).catch((error) => {
          console.error('Failed to force sync on reconnect:', error);
        });
      } else if (!isConnected && wasOnline) {
        // Network just went offline
        console.log('Network disconnected, stopping sync...');
        stopBackgroundSync();
      }
    });

    // Subscribe to app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const wasBackground = appState.current.match(/inactive|background/);
      const isNowForeground = nextAppState === 'active';
      
      appState.current = nextAppState;

      if (isNowForeground && wasBackground && isOnlineRef.current) {
        // App came to foreground and we're online - sync immediately
        console.log('App foregrounded, forcing sync...');
        forceSyncNow(userId).catch((error) => {
          console.error('Failed to sync on app foreground:', error);
        });
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeNetInfo();
      subscription.remove();
      stopBackgroundSync();
    };
  }, [userId]);
}

