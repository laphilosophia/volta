# Integration Guide

This guide covers how to extend Volta with custom components and integrate with external APIs.

## Adding Custom Components

Volta allows you to register your own React components to be used in the Designer.

1.  **Create your Component**:
    Create a standard React component in `src/components`.

    ```tsx
    // src/components/MyCustomCard.tsx
    import React from 'react'

    export const MyCustomCard = ({ title, content }) => (
      <div className="card">
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
    )
    ```

2.  **Register the Component**:
    Add your component to the `componentRegistry` in `src/core/component-registry/index.ts`.

    ```ts
    import { MyCustomCard } from '../../components/MyCustomCard'
    import { componentRegistry } from './registry'

    componentRegistry.register('custom-card', MyCustomCard, {
      label: { en: 'Custom Card' },
      icon: 'square', // Lucide icon name
      props: {
        title: { type: 'string', label: 'Title' },
        content: { type: 'string', label: 'Content', inputType: 'textarea' },
      },
    })
    ```

3.  **Use in Designer**:
    Your component will now appear in the Designer palette!

## Configuring APIs

Volta connects to your backend via the `src/voltaboard.config.ts` file.

1.  **Define a Service**:
    A service represents a base URL (e.g., your backend API).

    ```ts
    // voltaboard.config.ts
    services: {
      myApi: {
        baseUrl: 'https://api.example.com/v1',
        headers: { 'X-App-ID': 'volta-app' }
      }
    }
    ```

2.  **Define Endpoints**:
    Endpoints map specific paths to services.

    ```ts
    // voltaboard.config.ts
    endpoints: {
      getUsers: {
        service: 'myApi',
        path: '/users',
        method: 'GET'
      }
    }
    ```

3.  **Bind in Designer**:
    Select a component in the Designer, go to the "Data Source" tab, and select "API Endpoint". Choose `getUsers` from the dropdown.

## Theming

Volta uses CSS variables for theming. You can customize the look and feel by editing `src/index.css`.

- `--color-primary`: Main brand color.
- `--color-background`: Page background color.
- `--color-surface`: Card/Container background color.
