import { test, expect } from '@playwright/test';

test.describe('Table Rendering', () => {
  test('renders simple demo table with data', async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=simple');

    // Wait for table to be visible
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });

    // Verify rows exist in the table body
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    // Simple demo data has 25 records; with default page size of 10, we should see up to 10 rows
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThanOrEqual(25);
  });

  test('renders complex demo table with nested data', async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=complex');

    // Wait for table to be visible
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });

    // Verify rows exist
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    // Complex demo data has 15 records (may show more due to secondary tables)
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('displays table title and description for simple data', async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=simple');

    // Wait for table to appear
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });

    // Verify the page shows the correct title
    await expect(page.getByText('Demo: Tabla Simple')).toBeVisible();
  });

  test('displays table title and description for complex data', async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=complex');

    // Wait for table to appear
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });

    // Verify the page shows the correct title
    await expect(page.getByText('Demo: Tabla Compleja')).toBeVisible();
  });

  test('displays column headers', async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=simple');

    // Wait for table to render
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });

    // The simple dataset includes these column names in the headers
    // Column headers are rendered as buttons inside table headers
    const headerRow = page.locator('thead tr').first();
    await expect(headerRow).toBeVisible();

    // There should be multiple column headers
    const headers = headerRow.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(3);
  });
});
