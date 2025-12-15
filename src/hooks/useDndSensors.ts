// ============================================================================
// useDndSensors Hook - DnD Kit Sensor Configuration
// ============================================================================

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

/**
 * Custom hook to provide consistent DnD sensors across the application.
 * This prevents code duplication and ensures uniform drag behavior.
 *
 * @returns Configured DnD sensors for use with DndContext
 */
export function useDndSensors() {
  const pointerSensor = useSensor(PointerSensor, {
    // Require a minimum drag distance to prevent accidental drags
    activationConstraint: {
      distance: 8,
    },
  })

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })

  const sensors = useSensors(pointerSensor, keyboardSensor)

  return sensors
}
