/**
 * Test Utilities for Mobile App
 * Reusable test helpers and render functions
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Creates a test QueryClient with default options
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Renders a component with necessary providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock data factories
 */
export const createMockDailyEntry = (overrides = {}) => ({
  id: 'test-entry-id',
  user_id: 'test-user-id',
  entry_date: new Date().toISOString().split('T')[0],
  cravings_intensity: 5,
  feelings: ['anxious', 'hopeful'],
  triggers: [],
  coping_actions: [],
  gratitude: 'Test gratitude',
  notes: 'Test notes',
  is_shared_with_sponsor: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockStep = (overrides = {}) => ({
  id: 'step-1',
  program: 'NA' as const,
  step_number: 1,
  title: 'Step 1: We admitted we were powerless',
  prompts: [
    {
      id: 'prompt-1',
      text: 'In what ways have you felt powerless?',
      hint: 'Consider specific situations',
    },
  ],
  created_at: new Date().toISOString(),
  ...overrides,
});

