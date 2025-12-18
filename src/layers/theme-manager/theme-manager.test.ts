import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createThemeManager, ThemeManager } from './theme-manager'

interface TestTheme {
  colors: {
    primary: string
    secondary: string
  }
  spacing: {
    small: number
    medium: number
  }
}

const defaultTheme: TestTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
  },
  spacing: {
    small: 4,
    medium: 8,
  },
}

describe('ThemeManager', () => {
  let themeManager: ThemeManager<TestTheme>

  beforeEach(() => {
    themeManager = createThemeManager<TestTheme>({
      defaultTheme,
    })
    // Clear localStorage mock
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  describe('getTheme', () => {
    it('should return default theme initially', () => {
      expect(themeManager.getTheme()).toEqual(defaultTheme)
    })
  })

  describe('get (dot notation access)', () => {
    it('should access nested values with dot notation', () => {
      expect(themeManager.get('colors.primary')).toBe('#007bff')
      expect(themeManager.get('spacing.small')).toBe(4)
    })

    it('should return undefined for non-existent path', () => {
      expect(themeManager.get('colors.nonexistent')).toBeUndefined()
      expect(themeManager.get('invalid.path.deep')).toBeUndefined()
    })
  })

  describe('setTheme', () => {
    it('should replace entire theme', () => {
      const newTheme: TestTheme = {
        colors: { primary: '#ff0000', secondary: '#00ff00' },
        spacing: { small: 2, medium: 4 },
      }

      themeManager.setTheme(newTheme)
      expect(themeManager.getTheme()).toEqual(newTheme)
    })

    it('should set tenant ID when provided', () => {
      themeManager.setTheme(defaultTheme, 'tenant-123')
      expect(themeManager.getTenantId()).toBe('tenant-123')
    })
  })

  describe('updateTheme', () => {
    it('should merge partial updates with current theme', () => {
      themeManager.updateTheme({
        colors: { primary: '#ff0000', secondary: '#6c757d' },
      })

      const updated = themeManager.getTheme()
      expect(updated.colors.primary).toBe('#ff0000')
      expect(updated.colors.secondary).toBe('#6c757d')
      expect(updated.spacing).toEqual(defaultTheme.spacing)
    })

    it('should handle deep partial updates', () => {
      themeManager.updateTheme({
        spacing: { small: 2, medium: 8 },
      })

      const updated = themeManager.getTheme()
      expect(updated.spacing.small).toBe(2)
      expect(updated.spacing.medium).toBe(8)
      expect(updated.colors).toEqual(defaultTheme.colors)
    })
  })

  describe('reset', () => {
    it('should reset to default theme', () => {
      const newTheme: TestTheme = {
        colors: { primary: '#ff0000', secondary: '#00ff00' },
        spacing: { small: 2, medium: 4 },
      }

      themeManager.setTheme(newTheme, 'tenant-123')
      expect(themeManager.getTheme()).not.toEqual(defaultTheme)

      themeManager.reset()
      expect(themeManager.getTheme()).toEqual(defaultTheme)
      expect(themeManager.getTenantId()).toBeUndefined()
    })
  })

  describe('subscribe', () => {
    it('should notify subscribers on theme change', () => {
      const callback = vi.fn()
      themeManager.subscribe(callback)

      themeManager.setTheme({
        colors: { primary: '#ff0000', secondary: '#00ff00' },
        spacing: { small: 2, medium: 4 },
      })

      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should stop notifying after unsubscribe', () => {
      const callback = vi.fn()
      const unsubscribe = themeManager.subscribe(callback)

      themeManager.setTheme({
        colors: { primary: '#ff0000', secondary: '#00ff00' },
        spacing: { small: 2, medium: 4 },
      })
      expect(callback).toHaveBeenCalledTimes(1)

      unsubscribe()

      themeManager.setTheme(defaultTheme)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should notify on updateTheme', () => {
      const callback = vi.fn()
      themeManager.subscribe(callback)

      themeManager.updateTheme({ colors: { primary: '#000', secondary: '#fff' } })

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('getTenantId', () => {
    it('should return undefined when no tenant loaded', () => {
      expect(themeManager.getTenantId()).toBeUndefined()
    })

    it('should return tenant ID after setTheme with tenantId', () => {
      themeManager.setTheme(defaultTheme, 'acme-corp')
      expect(themeManager.getTenantId()).toBe('acme-corp')
    })
  })

  describe('createThemeManager factory', () => {
    it('should create a new ThemeManager instance', () => {
      const manager = createThemeManager({ defaultTheme })
      expect(manager).toBeInstanceOf(ThemeManager)
      expect(manager.getTheme()).toEqual(defaultTheme)
    })
  })
})
