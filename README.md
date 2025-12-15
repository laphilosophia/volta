# Volta - High-Performance Low-Code Platform

Volta is a modern, high-performance low-code platform built with React, TypeScript, and Tailwind CSS. It empowers developers to create dynamic, metadata-driven applications with a powerful visual designer and a robust runtime engine.

## 🚀 Features

- **Visual Designer**: Drag-and-drop interface for building pages and layouts.
- **Metadata-Driven**: All components and pages are defined by JSON metadata, making them portable and versionable.
- **Dynamic Runtime**: A lightweight rendering engine that interprets metadata to render the final application.
- **Headless Integration**: Connect to any API, database, or static data source seamlessly.
- **Component Registry**: Extensible architecture to add custom React components.
- **Theming Engine**: Built-in support for dark mode, localization (i18n), and custom branding.

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

## 📂 Project Structure

- `src/components`: React components (Designer, Predefined UI elements).
- `src/core`: Core logic (Rendering Engine, State Management, API Client).
- `src/runtime`: The end-user runtime environment.
- `src/designer`: The visual builder environment.
- `voltaboard.config.ts`: Configuration for API endpoints and services.

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Integration Guide](docs/INTEGRATION.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🤝 Contributing

Contributions are welcome! Please read our contribution guidelines before submitting a pull request.

## 📄 License

MIT License.
