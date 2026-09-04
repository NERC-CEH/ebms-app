import { expect, type Page } from '@playwright/test';

export async function openSurvey(page: Page, name: string) {
  await page.locator('#home-home').getByText(name, { exact: true }).click();
}

export async function selectSpecies(page: Page, search: string, name: string) {
  await page.getByRole('searchbox', { name: 'search text' }).fill(search);
  const result = page.locator('.search-result').filter({ hasText: name });
  await expect(result).toBeVisible();
  await result.click();
}

export async function walkSurveyArea(page: Page) {
  for (const longitude of [-0.12, -0.1195, -0.119]) {
    await page.evaluate(coords => (window as any).testing.GPS.update(coords), {
      latitude: 51.5,
      longitude,
      accuracy: 5,
    });
  }
}
