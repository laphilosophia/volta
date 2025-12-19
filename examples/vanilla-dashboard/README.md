# Volta Vanilla Dashboard

A minimal dashboard example demonstrating Volta's framework-agnostic API.

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

| Feature                    | Usage                           |
| -------------------------- | ------------------------------- |
| `initVolta()`              | Initialize Volta with config    |
| `voltaQuery()`             | Data fetching (GET)             |
| `mutate()`                 | Data mutation (POST/PUT/DELETE) |
| `createStore()`            | Create state store              |
| `getStore()`               | Access store                    |
| `invalidate()`             | Clear cache                     |
| `isNetworkOnline()`        | Network status                  |
| `getPendingRequestCount()` | Pending requests                |
| `register()`               | Register component definition   |
| `query()`                  | Data binding factory            |
| `store()`                  | State binding factory           |
| `listComponents()`         | List registered components      |
| `getComponentTypes()`      | Get component types             |
| `clearRegistry()`          | Clear registry                  |

## 📂 File Structure

```
vanilla-dashboard/
├── index.html          # Main HTML template
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
├── public/
│   └── mockServiceWorker.js  # MSW service worker
└── src/
    ├── main.ts         # Application entry point
    └── styles.css      # CSS styles
```

## 🔧 Volta API Usage

```typescript
// 1. Initialize Volta
initVolta({
  baseUrl: '/api',
  enableDevTools: true,
  cache: { staleTime: 30000 },
})

// 2. Fetch data
const users = await voltaQuery<User[]>('/users')

// 3. Create data
await mutate(
  '/users',
  { name: 'John' },
  {
    method: 'POST',
    invalidates: ['/users'],
  }
)

// 4. Use store
const uiStore = createStore('ui', {
  initialState: { theme: 'dark' },
})
uiStore.setState({ theme: 'light' })

// 5. Use ComponentRegistry
register('user-card', {
  type: 'display',
  data: query({ endpoint: '/users/:id', params: ['id'] }),
  state: store({ initial: { expanded: false } }),
  theme: ['colors.primary', 'spacing.md'],
})
```

## 🎯 Learning Objectives

1. **Using Volta without React** - Full API access with Vanilla JS
2. **Cache invalidation** - Clear cache after mutations
3. **State management** - Sthira-based stores
4. **Network awareness** - Track online/offline status
5. **ComponentRegistry** - register, query, store factories
