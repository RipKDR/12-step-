/**
 * Test Setup File
 * Configures testing environment for web app tests
 */

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock tRPC
jest.mock('../../lib/trpc/react', () => ({
  TRPCReactProvider: ({ children }: { children: React.ReactNode }) => children,
  trpc: {
    users: {
      getProfile: {
        useQuery: jest.fn(() => ({ data: null, isLoading: false })),
      },
    },
  },
}));

