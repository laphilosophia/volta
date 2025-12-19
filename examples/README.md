# Volta Examples

This directory showcases real-world usage of the Volta toolkit.

## Examples

| Example                                  | Description             | Features                                       |
| ---------------------------------------- | ----------------------- | ---------------------------------------------- |
| [vanilla-dashboard](./vanilla-dashboard) | Framework-agnostic demo | Vanilla API, ComponentRegistry, DOM            |
| [react-crm](./react-crm)                 | React hooks showcase    | useVoltaQuery, useVoltaComponent, ThemeManager |
| [component-builder](./component-builder) | Low-code platform demo  | Dynamic registration, derived stores           |

## Getting Started

Each example can run independently:

```bash
cd examples/<example-name>
npm install
npm run dev
```

## Mock Server

All examples use [MSW (Mock Service Worker)](https://mswjs.io/).
Mock handlers are defined in `shared/mocks/`.

## Requirements

- Node.js 18+
- pnpm (recommended) or npm
