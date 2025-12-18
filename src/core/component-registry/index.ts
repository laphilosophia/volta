// Component Registry - Vanilla API Exports
export {
  clearRegistry,
  createDerivedStore,
  createInstance,
  createLegacyDerivedStore,
  destroyInstance,
  getComponent,
  getComponentTypes,
  getInstanceCount,
  hasComponent,
  listComponents,
  listComponentsByType,
  query,
  register,
  resolveDataBindings,
  resolveStateBindings,
  resolveThemeBindings,
  store,
  unregister,
} from './ComponentRegistry'

export type { DerivedStoreResult, ResolvedData, ResolvedTheme } from './ComponentRegistry'

export type {
  ComponentDefinition,
  ComponentInstance,
  DataBinding,
  QueryConfig,
  QueryRef,
  RegistrationResult,
  StateBinding,
  StoreConfig,
  StoreRef,
} from '../types/component'
