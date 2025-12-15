# Modern CRM Platform PoC (Starter Kit)

A powerful, open-source Proof of Concept (PoC) and starter kit for building metadata-driven, white-label CRM platforms.

This project demonstrates a scalable architecture using **React 18+**, **TypeScript**, and a **Metadata-Driven** approach. It allows developers to bootstrap enterprise-grade applications with dynamic rendering, theming, and multi-tenancy support out of the box.

**Status**: _Proof of Concept / Starter Project_

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── core/                     # Core platform infrastructure
│   ├── component-registry/   # Dynamic component registration
│   ├── rendering-engine/     # Metadata-driven rendering
│   ├── state-management/     # Zustand stores
│   ├── theme-engine/         # White-label theming
│   ├── i18n/                 # Internationalization
│   └── types.ts              # Core TypeScript types
├── components/
│   └── predefined/           # Built-in components
│       ├── DataTree/         # Hierarchical data display
│       ├── DataTable/        # Data table with sorting/pagination
│       ├── Graph/            # Charts (ECharts)
│       ├── Input/            # Form inputs
│       └── MultiSelect/      # Multi-select dropdown
├── designer/                 # Dashboard builder UI
└── runtime/                  # Production rendering mode
```

## 🏗️ Architecture

### Core Systems

1. **Component Registry** - Dynamic component registration with lazy loading
2. **Metadata Engine** - Backend JSON metadata to UI mapping
3. **Rendering Engine** - Dynamic component rendering with error boundaries
4. **Theme Engine** - White-label theming with CSS variables
5. **State Management** - Zustand-based stores for tenant, metadata, runtime, and designer state

### Key Features

- **1000+ Tenants** - White-label support with CDN-based configuration
- **Metadata-Driven** - UI configuration via backend JSON
- **Multi-Language** - i18n with react-i18next
- **Dynamic Theming** - Runtime theme switching
- **Code Splitting** - Lazy loading for optimal bundle size

## 🛠️ Technology Stack

| Layer     | Technology                   |
| --------- | ---------------------------- |
| Framework | React 18+                    |
| Language  | TypeScript                   |
| State     | Zustand                      |
| Styling   | Tailwind CSS + CSS Variables |
| Build     | Vite                         |
| Forms     | React Hook Form + Zod        |
| i18n      | react-i18next                |
| Charts    | Apache ECharts               |
| Tables    | TanStack Table               |
| Icons     | Lucide React                 |

## 🎨 Theming

Themes are loaded from CDN based on tenant subdomain:

```typescript
// Tenant theme structure
interface TenantTheme {
  tenantId: string
  colors: {
    primary: string
    secondary: string
    accent: string
    neutral: string
  }
  logo: string
  favicon: string
}
```

## 🌐 Routes

- `/app/*` - Runtime application (production mode)
- `/designer/*` - Dashboard designer (edit mode)

## 📦 Available Components

| Component   | Type   | Description                                    |
| ----------- | ------ | ---------------------------------------------- |
| DataTree    | tree   | Hierarchical data display with expand/collapse |
| DataTable   | table  | Sortable, paginated data tables                |
| Graph       | graph  | Line, bar, pie, area charts                    |
| Input       | input  | Text inputs with validation                    |
| MultiSelect | select | Multi-select dropdown with search              |

## 🔧 Development

### Adding a New Component

1. Create component in `src/components/predefined/`
2. Register in `src/core/component-registry/ComponentRegistry.ts`
3. Component will be available for metadata-driven rendering

### Creating a New Store

```typescript
import { create } from 'zustand'

interface MyState {
  // ...
}

export const useMyStore = create<MyState>((set) => ({
  // ...
}))
```

## �️ Roadmap & Todo

As a PoC/Starter project, we have an exciting roadmap:

- [ ] Enhanced Designer V2 (Drag & Drop Form Builder)
- [ ] Server-Side Rendering (SSR) limits investigation
- [ ] Dynamic Data Source Integration
- [ ] Full Layout Serialization

## 🤝 Contributing

Contributions are welcome! We appreciate help in improving this PoC. Please feel free to open issues or submit pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## �📄 License

MIT
