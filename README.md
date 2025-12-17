[![Volta](/docs/assets/banner.png)](https://github.com/laphilosophia/volta)

# Volta - LC/NC Builder Toolkit

Volta is a **toolkit for developers who want to build low-code/no-code platforms**. It provides the essential building blocks: state management, data layers, component registry, and React adapters.

> **Note**: Volta is not a visual builder itself—it's the foundation that powers them.

[![npm version](https://img.shields.io/npm/v/@voltakit/volta.svg)](https://www.npmjs.com/package/@voltakit/volta)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Part of Sthira](https://img.shields.io/badge/Part%20of-Sthira%20Ecosystem-purple.svg)](https://github.com/laphilosophia)

## 🎯 What Volta Provides

| Category          | Features                                                   |
| ----------------- | ---------------------------------------------------------- |
| **Core**          | Component Registry, API Client, Type Definitions           |
| **Layers**        | ThemeManager, DataLayer, StateLayer                        |
| **Primitives**    | Headless builder component patterns                        |
| **React Adapter** | `useVoltaQuery`, `useVoltaMutation`, `useVoltaStore` hooks |

## 📦 Installation

```bash
npm install @voltakit/volta
```

> @voltakit/volta uses @sthirajs/\* under the hood. For a detailed explanation, see [Sthira](https://github.com/laphilosophia/sthira).

> All `@sthirajs/*` packages are bundled—no extra dependencies needed!

## 🚀 Quick Start

### Data Fetching

```typescript
import { initDataLayer, getDataLayer } from '@voltakit/volta'

// Initialize
initDataLayer({
  baseUrl: 'https://api.example.com',
  cache: { staleTime: 60000 },
})

// Use anywhere
const users = await getDataLayer().get('/users')
const user = await getDataLayer().get('/users/:id', { path: { id: '123' } })
```

### State Management

```typescript
import { initStateLayer, getStateLayer } from '@voltakit/volta'

// Initialize
initStateLayer({ enableDevTools: true })

// Create stores
const userStore = getStateLayer().createStore('user', {
  initialState: { name: '', email: '' },
})
```

### React Hooks

```tsx
import { react } from '@voltakit/volta'
const { useVoltaQuery, useVoltaMutation, useVoltaStore } = react

function UserList() {
  const { data, isLoading } = useVoltaQuery('/users')

  if (isLoading) return <div>Loading...</div>
  return (
    <ul>
      {data?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## 📂 Project Structure

```
src/
├── core/                    # Pure TypeScript (framework-agnostic)
│   ├── api/                 # ApiClient, errors, types
│   ├── component-registry/
│   └── types/
│
├── layers/                  # Application-level contexts
│   ├── ThemeManager/        # White-label theming
│   ├── DataLayer/           # Data fetching with caching
│   └── StateLayer/          # State management
│
├── primitives/              # Headless builder components
│
├── react/                   # React adapter
│   ├── hooks/               # useVoltaQuery, useVoltaMutation, useVoltaStore
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
npm run test   # Test (68 tests)
```

## 🤝 Contributing

Contributions welcome! See [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT License.

---

**Part of the Sthira ecosystem** - [github.com/laphilosophia](https://github.com/laphilosophia)
