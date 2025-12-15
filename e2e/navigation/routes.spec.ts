import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')

    // Verify page loaded
    await expect(page).toHaveTitle(/Volta/)
  })

  test('should navigate to designer', async ({ page }) => {
    await page.goto('/designer')

    // Verify designer loaded
    await expect(page.locator('[data-testid="designer-canvas"]')).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to components demo', async ({ page }) => {
    await page.goto('/components')

    // Verify components page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
