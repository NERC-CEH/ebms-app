import { test, expect } from './fixtures';

test('first launch setup reaches the main survey navigation', async ({
  page,
}) => {
  await page.route('https://warehouse1.indicia.org.uk/**', route =>
    route.fulfill({ json: { data: [] } })
  );

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Select your language' })
  ).toBeVisible();

  await page.getByText('English', { exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Select your country' })
  ).toBeVisible();
  await page.getByText('Elsewhere', { exact: true }).click();

  await expect(page.locator('#welcome-page')).toBeVisible();
  await expect(page.getByText('Butterflies', { exact: true })).toBeVisible();

  const nextButton = page
    .locator('#welcome-page ion-footer')
    .getByRole('button');
  for (let slide = 0; slide < 5; slide++) await nextButton.click();

  await expect(page.locator('#home-home')).toBeVisible();
  await expect(page.getByText('15min Count', { exact: true })).toBeVisible();
  await expect(
    page.getByText('15min Single Species Count', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('eBMS Transect', { exact: true })).toBeVisible();
  await expect(page.getByText('Moth survey', { exact: true })).toBeVisible();
});
