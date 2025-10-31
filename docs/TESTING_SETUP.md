# Testing Setup Guide

## Overview

Basic test structure has been created following the patterns in `.cursor/rules/testing.mdc`.

## Test Structure

```
apps/mobile/
├── __tests__/
│   ├── setup.ts              # Test environment setup
│   ├── components/           # Component tests
│   │   └── Button.test.tsx   # Example test
│   └── utils/
│       └── test-utils.tsx    # Test utilities & helpers

apps/web/
├── src/
│   └── __tests__/
│       ├── setup.ts          # Test environment setup
│       └── utils/
│           └── test-utils.tsx # Test utilities

packages/api/
└── src/
    └── __tests__/
        ├── setup.ts          # Test environment setup
        └── routers/
            └── daily.test.ts  # Example router test
```

## Installation

### Mobile App Tests
```bash
cd apps/mobile
pnpm add -D jest jest-expo @testing-library/react-native @testing-library/jest-native
```

### Web App Tests
```bash
cd apps/web
pnpm add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
```

### API Tests
```bash
cd packages/api
pnpm add -D jest @jest/globals
```

## Running Tests

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Then run:
```bash
# From monorepo root
pnpm test

# From specific package
cd apps/mobile && pnpm test
```

## Test Utilities

### Mobile App
- `renderWithProviders()` - Renders components with QueryClient provider
- `createTestQueryClient()` - Creates test QueryClient
- `createMockDailyEntry()` - Creates mock daily entry data
- `createMockStep()` - Creates mock step data

### Web App
- `renderWithProviders()` - Renders components with QueryClient provider
- `createTestQueryClient()` - Creates test QueryClient

## Example Tests

See example test files:
- `apps/mobile/__tests__/components/Button.test.tsx`
- `packages/api/src/routers/__tests__/daily.test.ts`

## Next Steps

1. Install testing dependencies
2. Add test scripts to package.json
3. Write tests for critical components
4. Set up CI/CD to run tests automatically
5. Add coverage reporting

## Testing Guidelines

Follow patterns in `.cursor/rules/testing.mdc`:
- Unit tests for components and utilities
- Integration tests for API routers
- E2E tests for critical workflows (requires Detox for mobile, Playwright for web)

