# Installation

## Requirements

- Node.js 18+
- TypeScript 5.0+ (recommended)
- React 18+ or 19+ (for React adapter)

## Install

```bash
npm install @voltakit/volta
```

All `@sthirajs/*` dependencies are bundled—no additional peer dependencies required.

## Peer Dependencies (Optional)

React is optional. If you're using the React adapter:

```bash
npm install react react-dom
```

## Package Exports

Volta provides multiple entry points for tree-shaking:

```typescript
// Full bundle (recommended for most cases)
import { initVolta, query, mutate, register } from '@voltakit/volta'

// Core only (no React, smaller bundle)
import { initVolta, query, mutate } from '@voltakit/volta/core'

// React adapter only
import { useVoltaComponent, useVoltaRegistry } from '@voltakit/volta/react'

// Layers (ThemeManager)
import { createThemeManager } from '@voltakit/volta/layers'
```

## TypeScript Configuration

Volta is written in TypeScript and provides full type definitions. Recommended `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## Next Steps

- [Initialization](initialization.md) - Configure and start Volta
