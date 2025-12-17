import { beforeEach, describe, expect, it } from 'vitest'
import { componentRegistry } from './index'

describe('ComponentRegistry', () => {
  beforeEach(() => {
    componentRegistry.clear()
  })

  describe('register and get', () => {
    it('should register and retrieve a component definition', () => {
      const def = {
        id: 'test-input',
        type: 'input' as const,
        schema: { type: 'object' },
        defaultProps: { placeholder: 'Enter text' },
        renderMode: 'both' as const,
        category: 'form-elements',
      }

      componentRegistry.register(def)
      const retrieved = componentRegistry.get('test-input')

      expect(retrieved).toEqual(def)
    })

    it('should return undefined for unregistered component', () => {
      expect(componentRegistry.get('non-existent')).toBeUndefined()
    })
  })

  describe('has', () => {
    it('should return true for registered component', () => {
      componentRegistry.register({
        id: 'test-button',
        type: 'custom' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'view' as const,
      })

      expect(componentRegistry.has('test-button')).toBe(true)
    })

    it('should return false for unregistered component', () => {
      expect(componentRegistry.has('non-existent')).toBe(false)
    })
  })

  describe('list', () => {
    it('should return empty array when no components registered', () => {
      expect(componentRegistry.list()).toEqual([])
    })

    it('should return all registered components', () => {
      const def1 = {
        id: 'comp-1',
        type: 'input' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'edit' as const,
      }
      const def2 = {
        id: 'comp-2',
        type: 'select' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'view' as const,
      }

      componentRegistry.register(def1)
      componentRegistry.register(def2)

      const list = componentRegistry.list()
      expect(list).toHaveLength(2)
      expect(list).toContainEqual(def1)
      expect(list).toContainEqual(def2)
    })
  })

  describe('listByCategory', () => {
    it('should filter components by category', () => {
      componentRegistry.register({
        id: 'form-input',
        type: 'input' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'both' as const,
        category: 'forms',
      })
      componentRegistry.register({
        id: 'chart-bar',
        type: 'graph' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'view' as const,
        category: 'charts',
      })
      componentRegistry.register({
        id: 'form-select',
        type: 'select' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'both' as const,
        category: 'forms',
      })

      const formComponents = componentRegistry.listByCategory('forms')
      expect(formComponents).toHaveLength(2)
      expect(formComponents.every((c) => c.category === 'forms')).toBe(true)
    })
  })

  describe('getCategories', () => {
    it('should return unique categories', () => {
      componentRegistry.register({
        id: 'c1',
        type: 'input' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'both' as const,
        category: 'forms',
      })
      componentRegistry.register({
        id: 'c2',
        type: 'input' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'both' as const,
        category: 'forms',
      })
      componentRegistry.register({
        id: 'c3',
        type: 'graph' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'view' as const,
        category: 'charts',
      })

      const categories = componentRegistry.getCategories()
      expect(categories).toHaveLength(2)
      expect(categories).toContain('forms')
      expect(categories).toContain('charts')
    })

    it('should not include undefined categories', () => {
      componentRegistry.register({
        id: 'no-category',
        type: 'custom' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'both' as const,
      })

      expect(componentRegistry.getCategories()).toEqual([])
    })
  })

  describe('unregister', () => {
    it('should remove a registered component', () => {
      componentRegistry.register({
        id: 'to-remove',
        type: 'input' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'edit' as const,
      })

      expect(componentRegistry.has('to-remove')).toBe(true)
      const result = componentRegistry.unregister('to-remove')
      expect(result).toBe(true)
      expect(componentRegistry.has('to-remove')).toBe(false)
    })

    it('should return false when unregistering non-existent component', () => {
      expect(componentRegistry.unregister('non-existent')).toBe(false)
    })
  })

  describe('clear', () => {
    it('should remove all registered components', () => {
      componentRegistry.register({
        id: 'c1',
        type: 'input' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'edit' as const,
      })
      componentRegistry.register({
        id: 'c2',
        type: 'select' as const,
        schema: {},
        defaultProps: {},
        renderMode: 'view' as const,
      })

      expect(componentRegistry.list()).toHaveLength(2)
      componentRegistry.clear()
      expect(componentRegistry.list()).toHaveLength(0)
    })
  })

  describe('validate', () => {
    it('should return true for registered component type', () => {
      componentRegistry.register({
        id: 'validatable',
        type: 'input' as const,
        schema: { required: ['value'] },
        defaultProps: {},
        renderMode: 'edit' as const,
      })

      const result = componentRegistry.validate({
        id: 'instance-1',
        type: 'validatable',
        props: { value: 'test' },
      })

      expect(result).toBe(true)
    })

    it('should return false for unknown component type', () => {
      const result = componentRegistry.validate({
        id: 'instance-1',
        type: 'unknown-type',
        props: {},
      })

      expect(result).toBe(false)
    })
  })
})
