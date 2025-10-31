// Mock data for demo purposes
export const mockProfile = {
  user_id: 'demo-user-123',
  handle: 'demo_user',
  display_name: 'Demo User',
  timezone: 'America/New_York',
  program: 'NA',
  avatar_url: null,
};

export const mockSobrietyStats = {
  currentStreakDays: 45,
  milestone: '45 days sober! 🎉',
  totalDays: 45,
  longestStreak: 45,
};

export const mockSteps = [
  {
    id: 'na-step-1',
    program: 'NA',
    step_number: 1,
    title: 'We admitted we were powerless over our addiction',
    prompts: [
      {
        id: 'powerlessness',
        text: 'Describe a time when you tried to control your addiction and it didn\'t work',
        hint: 'Think about specific attempts to moderate or quit on your own'
      },
      {
        id: 'consequences',
        text: 'What negative consequences have resulted from your addiction?',
        hint: 'Consider impacts on relationships, work, health, finances'
      },
      {
        id: 'unmanageability',
        text: 'How has your life become unmanageable due to addiction?',
        hint: 'Think about areas where you\'ve lost control or stability'
      }
    ]
  },
  {
    id: 'na-step-2',
    program: 'NA',
    step_number: 2,
    title: 'We came to believe that a Power greater than ourselves could restore us to sanity',
    prompts: [
      {
        id: 'belief',
        text: 'What does a Higher Power mean to you?',
        hint: 'This can be anything greater than yourself - nature, the group, a spiritual concept'
      },
      {
        id: 'sanity',
        text: 'How would you define sanity in the context of recovery?',
        hint: 'Think about what healthy, balanced living looks like for you'
      },
      {
        id: 'restoration',
        text: 'What aspects of your life need to be restored?',
        hint: 'Consider relationships, self-care, purpose, peace of mind'
      }
    ]
  },
  {
    id: 'na-step-3',
    program: 'NA',
    step_number: 3,
    title: 'We made a decision to turn our will and our lives over to the care of God as we understood Him',
    prompts: [
      {
        id: 'decision',
        text: 'What does turning your will over mean to you?',
        hint: 'Think about letting go of trying to control everything'
      },
      {
        id: 'trust',
        text: 'How can you practice trusting your Higher Power?',
        hint: 'Consider small daily acts of faith or surrender'
      },
      {
        id: 'care',
        text: 'What does being cared for by a Higher Power look like?',
        hint: 'Think about receiving guidance, strength, or peace'
      }
    ]
  }
];

export const mockDailyEntries = [
  {
    id: 'entry-1',
    entry_date: '2024-01-26',
    cravings_intensity: 3,
    feelings: ['hopeful', 'grateful'],
    triggers: ['stress', 'work'],
    coping_actions: ['meeting', 'prayer'],
    gratitude: 'Grateful for another day of sobriety and the support of my sponsor',
    notes: 'Had a challenging day at work but stayed focused on recovery',
    share_with_sponsor: true,
    created_at: '2024-01-26T20:00:00Z'
  },
  {
    id: 'entry-2',
    entry_date: '2024-01-25',
    cravings_intensity: 1,
    feelings: ['calm', 'peaceful'],
    triggers: [],
    coping_actions: ['meditation', 'exercise'],
    gratitude: 'Grateful for the peace and clarity I feel today',
    notes: 'Great day! Attended a meeting and felt very connected',
    share_with_sponsor: true,
    created_at: '2024-01-25T19:30:00Z'
  }
];

export const mockActionPlans = [
  {
    id: 'plan-1',
    title: 'Stress Response Plan',
    situation: 'When I feel overwhelmed or stressed',
    if_then: [
      {
        if: 'I feel like I need to use',
        then: 'Call my sponsor immediately'
      },
      {
        if: 'I can\'t reach my sponsor',
        then: 'Go to a meeting or call the crisis line'
      }
    ],
    checklist: [
      { label: 'Call sponsor', done: false },
      { label: 'Go to meeting', done: false },
      { label: 'Practice breathing', done: false }
    ],
    emergency_contacts: [
      { name: 'Sponsor', phone: '+1234567890' },
      { name: 'Crisis Line', phone: '1-800-273-8255' }
    ],
    is_shared_with_sponsor: true
  }
];

export const mockRoutines = [
  {
    id: 'routine-1',
    title: 'Morning Meditation',
    description: 'Daily 10-minute meditation practice',
    schedule: { type: 'daily', hour: 8, minute: 0 },
    active: true
  },
  {
    id: 'routine-2',
    title: 'Evening Gratitude',
    description: 'Write down three things I\'m grateful for',
    schedule: { type: 'daily', hour: 20, minute: 0 },
    active: true
  }
];
