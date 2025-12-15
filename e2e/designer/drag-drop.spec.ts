import { expect, test } from '@playwright/test'

test.describe('Designer Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer')

    // Wait for loading screen to disappear (lazy loading completes)
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 30000 })

    // Now wait for Designer container
    await expect(page.locator('[data-testid="designer-container"]')).toBeVisible({ timeout: 10000 })
  })

  test('should display component palette', async ({ page }) => {
    await expect(page.locator('[data-testid="component-palette"]')).toBeVisible()
  })

  test('should display toolbar with undo/redo buttons', async ({ page }) => {
    await expect(page.locator('[data-testid="toolbar-undo"]')).toBeVisible()
    await expect(page.locator('[data-testid="toolbar-redo"]')).toBeVisible()
    await expect(page.locator('[data-testid="toolbar-save"]')).toBeVisible()
  })

  test('should display at least one zone', async ({ page }) => {
    await expect(page.locator('[data-testid^="zone-"]').first()).toBeVisible()
  })

  test('should show text-input component in palette', async ({ page }) => {
    // Component ID is 'text-input' in registry
    await expect(page.locator('[data-testid="palette-text-input"]')).toBeVisible()
  })

  test('should drag component from palette to zone', async ({ page }) => {
    // Use correct component ID from registry
    const textInputPalette = page.locator('[data-testid="palette-text-input"]')
    const firstZone = page.locator('[data-testid^="zone-"]').first()

    await expect(textInputPalette).toBeVisible()
    await expect(firstZone).toBeVisible()

    // Perform drag and drop
    await textInputPalette.dragTo(firstZone)

    // Wait for component to appear - component type is 'text-input'
    await expect(page.locator('[data-component-type="text-input"]')).toBeVisible({ timeout: 10000 })
  })
})
