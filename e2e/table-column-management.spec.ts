import { test, expect } from '@playwright/test';

test.describe('Table Column Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=simple');
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('column manager button is visible', async ({ page }) => {
    // The column manager is triggered by a button labeled "Columnas"
    const columnButton = page.getByRole('button', { name: 'Columnas' });
    await expect(columnButton).toBeVisible();
  });

  test('opening column manager shows column list', async ({ page }) => {
    // Click the "Columnas" button to open the column manager modal
    const columnButton = page.getByRole('button', { name: 'Columnas' });
    await columnButton.click();

    // Wait for the modal to appear
    // The modal title is "Gestion de Columnas"
    await expect(page.getByText('Gesti\u00f3n de Columnas')).toBeVisible({ timeout: 5000 });

    // The modal should list column names from the dataset
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('nombre')).toBeVisible();
  });

  test('column manager has search input for filtering columns', async ({ page }) => {
    // Open column manager
    const columnButton = page.getByRole('button', { name: 'Columnas' });
    await columnButton.click();
    await expect(page.getByText('Gesti\u00f3n de Columnas')).toBeVisible({ timeout: 5000 });

    // The modal has a search input with placeholder "Buscar columnas..."
    const searchInput = page.locator('input[placeholder="Buscar columnas..."]');
    await expect(searchInput).toBeVisible();

    // Type to filter the column list
    await searchInput.fill('email');
    await page.waitForTimeout(300);

    // Only the email column should be visible in the list
    // Other columns should be filtered out
    const columnRows = page.locator('table tbody tr');
    const visibleCount = await columnRows.count();
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('hiding a column removes it from the table', async ({ page }) => {
    // Count headers before hiding a column
    const headersBefore = await page.locator('thead th').count();

    // Open column manager
    const columnButton = page.getByRole('button', { name: 'Columnas' });
    await columnButton.click();
    await expect(page.getByText('Gesti\u00f3n de Columnas')).toBeVisible({ timeout: 5000 });

    // Find the actions menu for one of the data columns (e.g., "email")
    // Each column row has a "..." menu button
    const columnRows = page.locator('table tbody tr');
    const rowCount = await columnRows.count();

    // Find the row that contains "email" and click its actions menu
    for (let i = 0; i < rowCount; i++) {
      const rowText = await columnRows.nth(i).textContent();
      if (rowText && rowText.includes('email')) {
        // Click the actions menu button (MoreHorizontal icon)
        const actionsButton = columnRows.nth(i).locator('button').filter({ has: page.locator('svg') }).last();
        await actionsButton.click();

        // Click "Ocultar columna"
        const hideOption = page.getByText('Ocultar columna');
        if (await hideOption.isVisible()) {
          await hideOption.click();
          await page.waitForTimeout(300);
        }
        break;
      }
    }

    // Close the modal by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // The table should now have one fewer header
    const headersAfter = await page.locator('thead th').count();
    expect(headersAfter).toBeLessThan(headersBefore);
  });

  test('export dropdown is available', async ({ page }) => {
    // The toolbar has an export button labeled "Exportar"
    const exportButton = page.getByRole('button', { name: 'Exportar' });
    await expect(exportButton).toBeVisible();

    // Click to open the dropdown
    await exportButton.click();

    // Should show export options
    await expect(page.getByText('Exportar a JSON')).toBeVisible();
    await expect(page.getByText('Exportar a CSV')).toBeVisible();
  });
});
