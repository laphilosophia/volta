# Volta React CRM

A React-based CRM example demonstrating Volta's React hooks and adapters.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Initialize MSW service worker
npx msw init public/ --save

# Start development server
npm run dev
```

## 📦 Demonstrated Features

| Hook                | Usage                                   |
| ------------------- | --------------------------------------- |
| `useVoltaQuery`     | Data fetching with caching              |
| `useVoltaMutation`  | POST/PUT/DELETE with optimistic updates |
| `useVoltaStore`     | Reactive state management               |
| `useVoltaComponent` | Auto-wire registered components         |
| `ThemeManager`      | Light/dark theme management             |

## 📂 File Structure

```
react-crm/
├── index.html          # HTML template
├── package.json        # Dependencies (React 19)
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
├── public/
│   └── mockServiceWorker.js  # MSW service worker
└── src/
    ├── main.tsx        # Entry point
    ├── App.tsx         # Main application
    └── styles.css      # Styles with theme support
```

## 🔧 React Hooks Usage

```tsx
// useVoltaQuery - Data fetching
const { data, isLoading, refetch } = useVoltaQuery<Stats>('/stats')

// useVoltaMutation - Mutations
const { mutate, isLoading } = useVoltaMutation<Customer>({
  onSuccess: () => refetch(),
})
await mutate('/customers', newCustomer, { method: 'POST' })

// useVoltaStore - State management
const [state, setState] = useVoltaStore('filters', {
  initialState: { showActive: true },
})

// useVoltaComponent - Auto-wiring
const { data, state, theme } = useVoltaComponent('customer-card', {
  props: { customerId: '123' },
  themeManager,
})
```

## 🎯 Learning Objectives

1. **React integration** - Volta hooks are React-first
2. **Data fetching** - useVoltaQuery with auto-caching
3. **Mutations** - useVoltaMutation with callbacks
4. **State management** - useVoltaStore for reactive state
5. **Component auto-wiring** - useVoltaComponent resolves bindings
6. **Theming** - ThemeManager for light/dark modes
