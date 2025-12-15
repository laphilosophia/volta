[![Volta](/docs/assets/banner.png)](https://github.com/laphilosophia/volta)

# Volta - High-Performance Low-Code Platform

Volta is a modern, high-performance low-code platform built with React, TypeScript, and Tailwind CSS. It empowers developers to create dynamic, metadata-driven applications with a powerful visual designer and a robust runtime engine.

## 🚀 Features

- **Visual Designer**: Drag-and-drop interface for building pages and layouts with **Undo/Redo and History Log**.
- **Metadata-Driven**: All components and pages are defined by JSON metadata, making them portable and versionable.
- **Dynamic Runtime**: A lightweight rendering engine that interprets metadata to render the final application.
- **Headless UI**: Core business logic is decoupled from presentation using headless components (`src/components/headless`).
- **Data Integration**: Connect to any API, database, or static data source seamlessly.
- **Component Registry**: Extensible architecture to add custom React components.
- **Theming Engine**: Built-in support for dark mode, localization (i18n), and custom branding.
- **Developer Tools**: Integrated **Storybook** for component development and **Vitest** for testing.

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/laphilosophia/volta.git
    cd volta
    ```

2.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

### Other Commands

- **Testing**: Run unit tests with `npm run test`.
- **Storybook**: Start component playground with `npm run storybook`.
- **Build**: Create a production build with `npm run build`.

## 📂 Project Structure

- `src/components`: React components including **Headless**, **Designer**, and **Predefined** UI elements.
- `src/core`: Core logic (Rendering Engine, State Management, API Client).
- `src/runtime`: The end-user runtime environment.
- `src/designer`: The visual builder environment.
- `src/voltaboard.config.ts`: Configuration for API endpoints and services.

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Integration Guide](docs/INTEGRATION.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## ⚡ CLI & Generators

Volta comes with a built-in CLI to streamline development. Use the generator to create new components with the correct structure and boilerplate.

```bash
# Interactive mode
npm run generate

# Shortcut example
npm run generate headless MyComponent
```

Available generators:

- **Headless Component**: Creates a new component in `src/components/headless` with schema, types, and styles. (e.g. `npm run generate headless DataTable`)
- **Predefined Component**: Creates a reusable UI component in `src/components/predefined`. (e.g. `npm run generate predefined Card`)
- **Custom Hook**: Scaffolds a new React hook in `src/hooks`. (e.g. `npm run generate hook useAuth`)
- **Designer Definition**: Creates a metadata definition for the visual designer.

## 🤝 Contributing

Contributions are welcome! Please read our contribution guidelines before submitting a pull request.

## 📄 License

MIT License.
