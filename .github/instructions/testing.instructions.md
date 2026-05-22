---
description: "Use when writing tests, designing test strategy, choosing what to test, structuring test files, mocking, or validating test coverage for features."
---

# Testing Standards

## Strategy Hierarchy
1. **Integration tests** — API endpoint → DB → response (highest value)
2. **Unit tests** — complex algorithms, business rules, utilities
3. **E2E tests** — critical user paths only (login, checkout, data export)
4. **Contract tests** — API schema compatibility between services

## What to Test

### Always Test
- API endpoints: happy path + validation + auth + error cases
- Business logic with branching: calculations, state machines, rules
- Edge cases: empty input, max bounds, unicode, null values, duplicates
- Error handling: DB failures, timeout, invalid state transitions
- Async workflows: idempotency, retry behavior, ordering

### Never Test
- Framework wiring (Express routes exist, React renders)
- Trivial getters/setters
- Third-party library internals
- Implementation details (private methods, internal state)

## Test Structure

```typescript
describe('Feature: {feature name}', () => {
  describe('{scenario}', () => {
    it('should {expected behavior} when {condition}', async () => {
      // Arrange
      const input = createTestInput({ ... });
      
      // Act
      const result = await feature.execute(input);
      
      // Assert
      expect(result).toMatchObject({ ... });
    });
  });
});
```

## Naming
- Describe blocks: feature or scenario name
- Test names: `should {behavior} when {condition}`
- Test files: `{module}.test.ts` colocated or in `__tests__/`

## Mocking Rules
- Mock at system boundaries: external APIs, email, payment
- Use real DB for integration tests (in-memory or test container)
- Prefer dependency injection over module mocking
- If you need >3 mocks in a test, the code is too coupled
- Never mock the module you're testing

## API Test Pattern

```typescript
describe('POST /api/users', () => {
  it('should create user when valid input', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test' })
      .expect(201);
    
    expect(response.body.data).toMatchObject({
      email: 'test@example.com',
      name: 'Test',
    });
  });

  it('should return 400 when email missing', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test' })
      .expect(400);
    
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## Test Data
- Factory functions for test objects: `createTestUser(overrides?)`
- Minimal fixtures — only what the test needs
- No shared mutable state between tests
- Clean up after tests (transactions or truncate)

## Coverage
- Aim for meaningful coverage, not percentage targets
- 100% coverage of business logic paths
- Don't test framework code to boost numbers
- Uncovered code should be intentionally trivial

## CI Integration
- Tests run on every PR
- Fail the build on any test failure
- Report coverage diff (not absolute number)
- Flaky test = high priority bug
