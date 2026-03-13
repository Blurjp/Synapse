import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Where ideas')
    await expect(page.getByRole('button', { name: /start free trial/i })).toBeVisible()
  })

  test('displays navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Features' })).toBeVisible()
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible()
  })

  test('displays features section', async ({ page }) => {
    await page.locator('#features').scrollIntoViewIfNeeded()
    await expect(page.getByText('Save anything from anywhere')).toBeVisible()
  })

  test('displays use cases section', async ({ page }) => {
    await page.locator('#use-cases').scrollIntoViewIfNeeded()
    await expect(page.getByText('For creators')).toBeVisible()
  })
})
