---
description: "React and frontend standards. Component patterns, TanStack Query, Zustand, hooks, accessibility, responsive design, performance."
applyTo: "**/*.tsx"
---

# React / Frontend Standards

## Component Structure
```tsx
// 1. Imports
// 2. Types/interfaces
// 3. Component (export function, not default export)
// 4. Sub-components (if small and tightly coupled)
// 5. Helpers (non-exported utilities)
```

## State Management Rules
- **Server state**: TanStack Query — never store fetched data in local state
- **Global client state**: Zustand — only auth, theme, UI state that persists across routes
- **Component state**: useState — form inputs, toggles, local UI
- **Derived state**: Compute directly — never `useEffect` to sync state

## TanStack Query Patterns
```tsx
// Custom hook per resource
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => api.getUsers(filters),
  });
}

// Mutations with cache invalidation
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

## Component Rules
- Props interface defined above component
- Destructure props in function signature
- Early returns for loading/error/empty states
- Max 150 lines per component file (extract if larger)
- No inline styles — use Tailwind classes or CSS modules

## Hooks
- Custom hooks for reusable logic: `use{Feature}{Action}`
- Hooks do one thing — compose for complex behavior
- Never call hooks conditionally
- Return objects for >2 values: `{ data, isLoading, error }`

## Accessibility
- All images have `alt` text
- All form inputs have associated labels
- Interactive elements are focusable and keyboard-operable
- Use semantic HTML: `<nav>`, `<main>`, `<article>`, `<button>`
- Announce dynamic content changes with aria-live regions

## Performance
- `React.lazy` for route-level code splitting
- `useMemo` only for expensive computations (measure first)
- `useCallback` only when passing to memoized children
- Virtualize long lists (>100 items)
- Debounce search inputs (300ms default)

## Forbidden
- `any` type in component props
- `useEffect` for derived data
- `index` as key for dynamic lists
- Nested ternaries in JSX (extract to variables or early return)
- Direct DOM manipulation (use refs when absolutely necessary)
