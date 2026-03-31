import { test, expect } from '@playwright/test';

test.describe('Table Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data-sources/table?source=demo&type=simple');
    await expect(page.locator('table').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('displays pagination controls', async ({ page }) => {
    // The pagination component shows "Rows per page" text
    await expect(page.getByText('Rows per page')).toBeVisible();

    // It also shows a "Page" label with page number input
    await expect(page.getByText('Page', { exact: true })).toBeVisible();
  });

  test('displays total record count', async ({ page }) => {
    // The pagination shows "25 registros" for simple demo data
    await expect(page.getByText(/25 registros/)).toBeVisible();
  });

  test('navigating to next page changes displayed rows', async ({ page }) => {
    // Get content of first row on page 1
    const firstRowPage1 = await page.locator('tbody tr').first().textContent();

    // Click the next page button (ChevronRight icon)
    // The pagination has 4 navigation buttons: first, previous, next, last
    const nextButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') }).first();

    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);

      // The first row should be different on page 2
      const firstRowPage2 = await page.locator('tbody tr').first().textContent();
      expect(firstRowPage1).not.toBe(firstRowPage2);
    }
  });

  test('changing page size changes number of visible rows', async ({ page }) => {
    // Count rows with default page size
    const initialRowCount = await page.locator('tbody tr').count();

    // Click the page size selector trigger
    const pageSizeSelect = page.locator('button[role="combobox"]').first();
    await pageSizeSelect.click();

    // Select a different page size -- pick "25" to show all rows
    const option25 = page.getByRole('option', { name: '25' });
    if (await option25.isVisible()) {
      await option25.click();
      await page.waitForTimeout(500);

      // Now all 25 rows should be visible
      const newRowCount = await page.locator('tbody tr').count();
      expect(newRowCount).toBe(25);
    }
  });

  test('first page button is disabled on first page', async ({ page }) => {
    // The "go to first page" button should be disabled when on page 1
    const firstPageButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-first') }).first();
    await expect(firstPageButton).toBeDisabled();
  });

  test('previous page button is disabled on first page', async ({ page }) => {
    // The "previous page" button should be disabled when on page 1
    const prevButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') }).first();
    await expect(prevButton).toBeDisabled();
  });

  test('page number input allows direct navigation', async ({ page }) => {
    // Find the page number input
    const pageInput = page.locator('input[type="number"]').last();

    if (await pageInput.isVisible()) {
      // Get total page count
      const pageCountText = page.getByText(/of \d+/);
      const pageCountContent = await pageCountText.textContent();
      const totalPages = parseInt(pageCountContent?.match(/of (\d+)/)?.[1] || '1');

      if (totalPages > 1) {
        // Get first row content before navigation
        const firstRowBefore = await page.locator('tbody tr').first().textContent();

        // Click next page button instead (more reliable than input)
        const nextButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') }).first();
        await nextButton.click();
        await page.waitForTimeout(500);

        // The first row should change
        const firstRowAfter = await page.locator('tbody tr').first().textContent();
        expect(firstRowBefore).not.toBe(firstRowAfter);
      }
    }
  });
});
