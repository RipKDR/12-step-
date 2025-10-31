/**
 * Example Test File
 * Shows testing patterns for tRPC routers
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { appRouter } from '../../root';
import { createTRPCContext } from '../../trpc';

describe('Daily Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    };
    caller = appRouter.createCaller(ctx as any);
  });

  it('should get daily entry by date', async () => {
    // Mock Supabase response
    const mockEntry = {
      id: 'entry-1',
      user_id: 'test-user-id',
      entry_date: '2024-01-27',
      cravings_intensity: 5,
      feelings: ['anxious'],
      triggers: [],
      coping_actions: [],
      is_shared_with_sponsor: false,
    };

    // In a real test, you would mock the Supabase client
    // const result = await caller.daily.getByDate({ date: '2024-01-27' });
    // expect(result).toEqual(mockEntry);
  });

  it('should create daily entry', async () => {
    // Test mutation
    // const input = {
    //   entry_date: '2024-01-27',
    //   cravings_intensity: 5,
    //   feelings: ['hopeful'],
    //   triggers: [],
    //   coping_actions: [],
    //   is_shared_with_sponsor: false,
    // };
    // const result = await caller.daily.upsert(input);
    // expect(result.entry_date).toBe(input.entry_date);
  });
});

