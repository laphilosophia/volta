[![Volta](/docs/assets/banner.png)](https://github.com/laphilosophia/volta)

# Volta - LC/NC Builder Toolkit

Volta is a **toolkit for developers who want to build low-code/no-code platforms**. It provides the essential building blocks: component registry, data/state bindings, and React adapters.

> **Note**: Volta is not a visual builder itself—it's the foundation that powers them.

[![npm version](https://img.shields.io/npm/v/@voltakit/volta.svg)](https://www.npmjs.com/package/@voltakit/volta)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Part of Sthira](https://img.shields.io/badge/Part%20of-Sthira%20Ecosystem-purple.svg)](https://github.com/laphilosophia)

## 🎯 What Volta Provides

| Category          | Features                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| **Core**          | `register()`, `query()`, `store()`, Component Registry                    |
| **Layers**        | ThemeManager, DataLayer, StateLayer                                       |
| **Signals**       | `createDerivedStore()` with Sthira computed signals                       |
| **React Adapter** | `useVoltaComponent`, `useVoltaRegistry`, `useVoltaQuery`, `useVoltaStore` |

## 📦 Installation

```bash
npm install @voltakit/volta
```

> Built on `@sthirajs/*` - all dependencies bundled!

## 🚀 Quick Start

### Component Registration

```typescript
import { query, store, register } from '@voltakit/volta'

// Define data binding (lazy fetch)
const userData = query({
  endpoint: '/users/:userId',
  params: ['userId'],
})

// Define state binding (scoped per instance)
const userState = store({
  initial: { activeTab: 'info' },
})

// Register component
register('user-card', {
  type: 'data-display',
  component: () => import('./UserCard'),
  data: userData,
  state: userState,
  theme: ['colors.primary', 'colors.accent'],
})
```

### React Hook

```tsx
import { react } from '@voltakit/volta'
const { useVoltaComponent } = react

function UserCard({ userId }: { userId: string }) {
  const { data, theme, isLoading, refetch } = useVoltaComponent('user-card', {
    props: { userId },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div style={{ color: theme['colors.primary'] }}>
      <h2>{data.name}</h2>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

### Signal-Based Derived Stores

```typescript
import { signal } from '@sthirajs/core'
import { createDerivedStore } from '@voltakit/volta'

const count = signal(5)
const multiplier = signal(2)

const derived = createDerivedStore([count, multiplier], ([c, m]) => c * m)

console.log(derived.getValue()) // 10
count.set(10)
console.log(derived.getValue()) // 20
```

## 📂 Project Structure

```
src/
├── core/                    # Pure TypeScript (framework-agnostic)
│   ├── component-registry/  # register, query, store, bindings
│   └── types/
│
├── layers/                  # Application-level contexts
│   ├── theme-manager/       # White-label theming
│   ├── data-layer/          # Data fetching with caching
│   └── state-layer/         # State management
│
├── react/                   # React adapter
│   ├── hooks/               # useVoltaComponent, useVoltaRegistry
│   └── providers/
│
└── index.ts
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Integration Guide](docs/INTEGRATION.md)

## 🛠️ Development

```bash
npm install    # Install dependencies
npm run build  # Build
npm run lint   # Lint
npm run test   # Test (91 tests)
```

## 🤝 Contributing

Contributions welcome! See [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT License.

---

**Part of the Sthira ecosystem** - [github.com/laphilosophia](https://github.com/laphilosophia)
