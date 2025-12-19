# ThemeManager

ThemeManager provides white-label theming with CSS variables, multi-tenant support, and CDN-based theme loading.

## Overview

```typescript
import { createThemeManager } from '@voltakit/volta'

const themeManager = createThemeManager({
  defaultTheme: {
    colors: {
      primary: '#3B82F6',
      background: '#FFFFFF',
    },
    spacing: {
      sm: '8px',
      md: '16px',
    },
  },
})
```

## Creating a ThemeManager

### Basic Setup

```typescript
import { createThemeManager } from '@voltakit/volta'

interface AppTheme {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  spacing: {
    sm: string
    md: string
    lg: string
  }
}

const themeManager = createThemeManager<AppTheme>({
  defaultTheme: {
    colors: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    spacing: {
      sm: '8px',
      md: '16px',
      lg: '24px',
    },
  },
})
```

### With CSS Variables

```typescript
const themeManager = createThemeManager({
  defaultTheme: { ... },
  cssVariables: (theme) => ({
    '--color-primary': theme.colors.primary,
    '--color-background': theme.colors.background,
    '--spacing-md': theme.spacing.md,
  }),
})
```

CSS variables are automatically applied to `:root`.

### Dark Mode

```typescript
const themeManager = createThemeManager({
  defaultTheme: lightTheme,
  darkTheme: {
    colors: {
      primary: '#60A5FA',
      background: '#1F2937',
      text: '#F9FAFB',
    },
  },
})

// Toggle dark mode
themeManager.setDarkMode(true)

// Check current mode
const isDark = themeManager.isDarkMode()
```

## API

### get()

Get a theme value by path.

```typescript
themeManager.get('colors.primary') // '#3B82F6'
themeManager.get('spacing.md') // '16px'
```

### set()

Update theme values.

```typescript
themeManager.set({
  colors: {
    primary: '#EF4444',
  },
})
```

### subscribe()

Subscribe to theme changes.

```typescript
const unsubscribe = themeManager.subscribe((theme) => {
  console.log('Theme updated:', theme)
})

// Later
unsubscribe()
```

### loadTheme()

Load theme from a URL (for multi-tenant).

```typescript
await themeManager.loadTheme('https://cdn.example.com/themes/tenant-123.json')
```

## Multi-Tenant Theming

Load tenant-specific themes from CDN:

```typescript
const themeManager = createThemeManager({
  defaultTheme: baseTheme,
})

// On tenant detection
async function initTenantTheme(tenantId: string) {
  try {
    await themeManager.loadTheme(`https://cdn.example.com/themes/${tenantId}.json`)
  } catch {
    // Fallback to default
    console.warn('Tenant theme not found, using default')
  }
}
```

## Integration with useVoltaComponent

Pass themeManager to resolve theme bindings:

```tsx
const { theme } = useVoltaComponent('user-card', {
  themeManager,
})

// theme contains resolved token values
console.log(theme['colors.primary']) // '#3B82F6'
```

## React Provider

For app-wide theme access:

```tsx
import { ThemeProvider } from '@voltakit/volta/react'

function App() {
  return (
    <ThemeProvider themeManager={themeManager}>
      <YourApp />
    </ThemeProvider>
  )
}

// In components
import { useTheme } from '@voltakit/volta/react'

function ThemedButton() {
  const { theme, setDarkMode, isDarkMode } = useTheme()

  return (
    <button
      style={{ backgroundColor: theme.colors.primary }}
      onClick={() => setDarkMode(!isDarkMode)}
    >
      Toggle Dark Mode
    </button>
  )
}
```

## TypeScript

Full type inference:

```typescript
interface MyTheme {
  colors: {
    primary: string
    secondary: string
  }
  fonts: {
    body: string
    heading: string
  }
}

const themeManager = createThemeManager<MyTheme>({
  defaultTheme: {
    colors: { primary: '#000', secondary: '#666' },
    fonts: { body: 'Inter', heading: 'Poppins' },
  },
})

// Type-safe access
themeManager.get('colors.primary') // string
themeManager.get('colors.invalid') // ❌ TypeScript error
```

## Next Steps

- [Component Registry](../core-concepts/component-registry.md) - Theme bindings in registration
- [useVoltaComponent](../react/use-volta-component.md) - Theme resolution in React
