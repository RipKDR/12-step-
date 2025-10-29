import React from 'react';
import { Tabs } from 'expo-router';

// This component defines the tab bar structure and icons.
// Icons would typically be imported from a library like @expo/vector-icons
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        // Add accessibility labels for screen readers
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          // tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="step-work"
        options={{
          title: 'Step Work',
          // tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: 'Daily',
          // tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
       <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          // tabBarIcon: ({ color }) => <TabBarIcon name="flag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          // tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
