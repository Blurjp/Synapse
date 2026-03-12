# Frontend Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Test Structure

```
__tests__/
├── page.test.tsx           # Page tests
├── utils.test.ts           # Utility function tests
└── components/
    └── Button.test.tsx     # Component tests
```

## Coverage

- Pages: 5 tests
- Utils: 9 tests
- Components: 6 tests
- Total: 20+ tests
