[![Volta](/docs/assets/banner.png)](https://github.com/laphilosophia/volta)

# Volta - LC/NC Builder Toolkit

Volta is a **toolkit for developers who want to build low-code/no-code platforms**. It provides the essential building blocks: state management, data layers, component registry, and React adapters.

> **Note**: Volta is not a visual builder itself—it's the foundation that powers them.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Part of Sthira](https://img.shields.io/badge/Part%20of-Sthira%20Ecosystem-purple.svg)](https://github.com/laphilosophia)

## 🎯 What Volta Provides

### For Developers Building LC/NC Platforms

| Category          | Features                                         |
| ----------------- | ------------------------------------------------ |
| **Core**          | Component Registry, API Client, Type Definitions |
| **Layers**        | ThemeManager (white-label theming)               |
| **Primitives**    | Headless builder component patterns              |
| **React Adapter** | Hooks and providers for React                    |

### Design Philosophy

- **Metadata-driven**: Components defined by JSON schemas
- **Framework-agnostic core**: Pure TypeScript, React adapters optional
- **Extensible**: Plugin-friendly architecture
- **Type-safe**: Full TypeScript support

## 📦 Installation

```bash
npm install volta @sthirajs/core
```

## 🚀 Quick Start

```typescript
import { componentRegistry, ApiClient, themeManager } from 'volta'
import { react } from 'volta'

// Register a custom component
componentRegistry.register({
  id: 'my-input',
  type: 'input',
  schema: { type: 'object', properties: { label: { type: 'string' } } },
  defaultProps: { label: 'Default' },
  renderMode: 'edit',
  category: 'input',
})

// Initialize API client
const config = {
  services: {
    api: { baseUrl: 'https://api.example.com' },
  },
  endpoints: {
    getUsers: { service: 'api', path: '/users', method: 'GET' },
  },
}

// Apply tenant theme
themeManager.loadTheme('tenant-123')
```

## 📂 Project Structure

```
volta/
├── src/
│   ├── core/           # Pure TypeScript (framework-agnostic)
│   │   ├── api/        # ApiClient, errors, types
│   │   ├── component-registry/
│   │   └── types/
│   │
│   ├── layers/         # Application-level contexts
│   │   └── ThemeManager.ts
│   │
│   ├── primitives/     # Headless builder components
│   │
│   ├── react/          # React adapter (optional)
│   │   ├── hooks/
│   │   └── providers/
│   │
│   └── index.ts
```

## 🔗 Peer Dependencies

- `@sthirajs/core` - State management and data fetching
- `react` (optional) - For React adapter

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Integration Guide](docs/INTEGRATION.md)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Test
npm run test
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT License.

---

**Part of the Sthira ecosystem** - [github.com/laphilosophia](https://github.com/laphilosophia)
