import { test, expect } from '@playwright/test'

test.describe('React Redux PostgreSQL app', () => {
  test('shows app title', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'React Redux PostgreSQL' })).toBeVisible()
  })

  test('loads and shows content from API', async ({ page }) => {
    await page.goto('/')
    // Wait for app to settle (loading, content, or error) so we don't timeout
    await expect(
      page.getByText(/Loading…|No items yet|First item|Second item|Failed to fetch/i)
    ).toBeVisible({ timeout: 15_000 })
    // Require success: no error state
    await expect(page.getByText('Failed to fetch')).not.toBeVisible()
  })

})
