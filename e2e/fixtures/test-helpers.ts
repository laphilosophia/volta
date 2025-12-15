import { expect, test, type Page } from '@playwright/test'

/**
 * Common test utilities for Volta E2E testing.
 */

export { expect, test }

/**
 * Common test utilities
 */
export const testUtils = {
  /**
   * Navigate to designer and wait for it to load
   */
  async gotoDesigner(page: Page) {
    await page.goto('/designer')
    await page.waitForSelector('[data-testid="designer-canvas"]', { timeout: 10000 })
  },

  /**
   * Drag a component from palette to a zone
   */
  async dragComponentToZone(page: Page, componentType: string, zoneId: string = 'main') {
    const source = page.locator(`[data-testid="palette-${componentType}"]`)
    const target = page.locator(`[data-testid="zone-${zoneId}"]`)

    await source.dragTo(target)

    // Wait for component to appear
    await page.waitForSelector(`[data-component-type="${componentType}"]`, { timeout: 5000 })
  },

  /**
   * Select a component on the canvas
   */
  async selectComponent(page: Page, componentType: string) {
    await page.locator(`[data-component-type="${componentType}"]`).first().click()
    await page.waitForSelector('[data-testid="property-inspector"]', { timeout: 5000 })
  },

  /**
   * Click undo button
   */
  async undo(page: Page) {
    await page.locator('[data-testid="toolbar-undo"]').click()
  },

  /**
   * Click redo button
   */
  async redo(page: Page) {
    await page.locator('[data-testid="toolbar-redo"]').click()
  },

  /**
   * Get count of components in a zone
   */
  async getComponentCount(page: Page, zoneId: string = 'main') {
    return await page.locator(`[data-testid="zone-${zoneId}"] [data-component-type]`).count()
  },
}
