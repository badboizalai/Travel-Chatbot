import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/TravelMate/);
});

test('chatbot widget appears', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible();
});

test('demo page functionality', async ({ page }) => {
  await page.goto('http://localhost:3000/demo');
  await expect(page.locator('h1')).toContainText('Demo');
});

test('navigation works', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Weather');
  await expect(page).toHaveURL(/.*weather/);
});
