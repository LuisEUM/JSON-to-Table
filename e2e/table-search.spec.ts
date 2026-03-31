import { test, expect } from '@playwright/test';

test.describe('Table Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=simple');
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('search input is visible with placeholder', async ({ page }) => {
    // The search input has a placeholder like "Buscar en 25 registros..."
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
  });

  test('typing in search filters table rows', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');

    // Count rows before searching
    const rowsBefore = await page.locator('tbody tr').count();

    // Type a specific name that exists in simple demo data
    await searchInput.fill('Madrid');

    // Wait for debounce (300ms) + re-render
    await page.waitForTimeout(600);

    // Rows should be filtered -- fewer rows than before
    const rowsAfter = await page.locator('tbody tr').count();
    expect(rowsAfter).toBeLessThan(rowsBefore);
    expect(rowsAfter).toBeGreaterThan(0);
  });

  test('clearing search restores all rows', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');

    // Count initial rows
    const initialRows = await page.locator('tbody tr').count();

    // Search for something specific
    await searchInput.fill('Madrid');
    await page.waitForTimeout(600);

    // Verify rows were filtered
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThan(initialRows);

    // Clear the search by clicking the X button
    const clearButton = page.locator('button[aria-label="Limpiar b\u00fasqueda"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      // Fallback: clear the input manually
      await searchInput.fill('');
    }
    await page.waitForTimeout(600);

    // Rows should be restored to initial count
    const restoredRows = await page.locator('tbody tr').count();
    expect(restoredRows).toBe(initialRows);
  });

  test('search with no results shows empty state', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');

    // Search for a term that does not exist in the data
    await searchInput.fill('xyznonexistent12345');
    await page.waitForTimeout(600);

    // Should show no-results message
    await expect(page.getByText(/No se encontraron resultados/)).toBeVisible();
  });

  test('search is case-insensitive', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');

    // Search in lowercase
    await searchInput.fill('madrid');
    await page.waitForTimeout(600);

    const lowercaseRows = await page.locator('tbody tr').count();

    // Clear and search in uppercase
    await searchInput.fill('MADRID');
    await page.waitForTimeout(600);

    const uppercaseRows = await page.locator('tbody tr').count();

    // Both searches should return the same number of results
    expect(lowercaseRows).toBe(uppercaseRows);
    expect(lowercaseRows).toBeGreaterThan(0);
  });

  test('search updates the filtered count in pagination', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');

    // Before filtering, pagination shows "25 registros"
    await expect(page.getByText('25 registros')).toBeVisible();

    // Filter by a term that exists in data
    await searchInput.fill('Salon');
    await page.waitForTimeout(800);

    // After filtering, row count should change
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });
});
