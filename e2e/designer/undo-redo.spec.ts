import { expect, test } from '@playwright/test'

test.describe('Designer Undo/Redo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer')

    // Wait for loading screen to disappear (lazy loading completes)
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 30000 })

    // Now wait for Designer container
    await expect(page.locator('[data-testid="designer-container"]')).toBeVisible({ timeout: 10000 })
  })

  test('undo button should be disabled initially', async ({ page }) => {
    const undoButton = page.locator('[data-testid="toolbar-undo"]')
    await expect(undoButton).toBeVisible()
    await expect(undoButton).toBeDisabled()
  })

  test('redo button should be disabled initially', async ({ page }) => {
    const redoButton = page.locator('[data-testid="toolbar-redo"]')
    await expect(redoButton).toBeVisible()
    await expect(redoButton).toBeDisabled()
  })

  test('should enable undo after adding component', async ({ page }) => {
    // Use correct component ID from registry
    const textInputPalette = page.locator('[data-testid="palette-text-input"]')
    const firstZone = page.locator('[data-testid^="zone-"]').first()

    await expect(textInputPalette).toBeVisible()
    await textInputPalette.dragTo(firstZone)
    await expect(page.locator('[data-component-type="text-input"]')).toBeVisible({ timeout: 10000 })

    // Undo should now be enabled
    const undoButton = page.locator('[data-testid="toolbar-undo"]')
    await expect(undoButton).not.toBeDisabled()
  })

  test('should undo component addition', async ({ page }) => {
    const textInputPalette = page.locator('[data-testid="palette-text-input"]')
    const firstZone = page.locator('[data-testid^="zone-"]').first()

    await expect(textInputPalette).toBeVisible()
    await textInputPalette.dragTo(firstZone)
    await expect(page.locator('[data-component-type="text-input"]')).toBeVisible({ timeout: 10000 })

    // Click undo
    await page.locator('[data-testid="toolbar-undo"]').click()

    // Component should be removed
    await expect(page.locator('[data-component-type="text-input"]')).not.toBeVisible({
      timeout: 10000,
    })
  })

  test('should redo after undo', async ({ page }) => {
    const textInputPalette = page.locator('[data-testid="palette-text-input"]')
    const firstZone = page.locator('[data-testid^="zone-"]').first()

    await expect(textInputPalette).toBeVisible()
    await textInputPalette.dragTo(firstZone)
    await expect(page.locator('[data-component-type="text-input"]')).toBeVisible({ timeout: 10000 })

    // Undo
    await page.locator('[data-testid="toolbar-undo"]').click()
    await expect(page.locator('[data-component-type="text-input"]')).not.toBeVisible({
      timeout: 10000,
    })

    // Redo should be enabled now
    const redoButton = page.locator('[data-testid="toolbar-redo"]')
    await expect(redoButton).not.toBeDisabled()

    // Click redo
    await redoButton.click()

    // Component should reappear
    await expect(page.locator('[data-component-type="text-input"]')).toBeVisible({ timeout: 10000 })
  })
})
