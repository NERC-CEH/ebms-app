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

test('onboarding installs country moths and global bumblebees', async ({
  page,
}) => {
  const country = 'FR';
  const butterflyGroup = 104;
  const mothGroup = 114;
  const bumblebeeGroup = 110;
  const lists = [
    { id: 9100, name: 'France butterflies', group: butterflyGroup, country },
    { id: 9200, name: 'France moths', group: mothGroup, country },
    { id: 9300, name: 'Global moths', group: mothGroup, country: '' },
    { id: 9400, name: 'Global bumblebees', group: bumblebeeGroup, country: '' },
  ];
  const installedSpecies: number[] = [];

  await page.route('https://warehouse1.indicia.org.uk/**', async route => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/ebms_app_species_list.xml')) {
      installedSpecies.push(Number(url.searchParams.get('id')));
      await route.fulfill({ json: { data: [] } });
      return;
    }

    const requestedCountry = url.searchParams.get('location_code_filter');
    const requestedGroups = url.searchParams
      .get('species_groups_filter')
      ?.split(',')
      .map(Number);
    // Country results include both groups to check the default is unambiguous.
    const matchingLists = lists.filter(list =>
      requestedCountry
        ? list.country === requestedCountry
        : !list.country && requestedGroups?.includes(list.group)
    );

    await route.fulfill({
      json: {
        data: url.searchParams.get('updated_on_filter')
          ? []
          : matchingLists.map(list => ({
              id: list.id,
              type: list.group === butterflyGroup ? 'location' : 'list',
              name: list.name,
              species_groups: JSON.stringify([list.group]),
              location_code: list.country,
              taxa_count: '0',
              updated_on: new Date().toISOString(),
            })),
      },
    });
  });

  await page.goto('/');
  await page.getByText('English', { exact: true }).click();
  await page.getByText('Europe', { exact: true }).click();
  await page.getByText('France', { exact: true }).click();

  const nextButton = page
    .locator('#welcome-page ion-footer')
    .getByRole('button');

  for (let slide = 0; slide < 4; slide++) await nextButton.click();

  await page
    .getByRole('checkbox', { name: 'Moths', exact: true })
    .press('Space');
  await page
    .getByRole('checkbox', { name: 'Bumblebees', exact: true })
    .press('Space');
  await nextButton.click();
  await expect(page.locator('#home-home')).toBeVisible();
  await expect.poll(() => installedSpecies.sort()).toEqual([9100, 9200, 9400]);

  await page.goto('/settings/species-lists');
  await expect(
    page.getByText('France butterflies', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('France moths', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Global bumblebees', { exact: true })
  ).toBeVisible();
  await expect(page.getByText('Global moths', { exact: true })).toHaveCount(0);
});
