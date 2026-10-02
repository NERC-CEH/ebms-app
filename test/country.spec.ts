import { test, expect } from './fixtures';

for (const mothsFavourite of [true, false]) {
  test(`country changes install moths only when favourited (${mothsFavourite})`, async ({
    homePage: page,
  }) => {
    const butterflyGroup = 104;
    const mothGroup = 114;
    const installedGroups: number[] = [];

    await page.evaluate(async favourite => {
      const store = (window as any).mainStore;
      const app = (await store.findAll()).find(
        (record: any) => record.cid === 'app'
      );
      app.data.speciesGroups = favourite ? [104, 114] : [104];
      await store.save(app);
    }, mothsFavourite);
    await page.reload();
    await expect(page.locator('#home-home')).toBeVisible();

    await page.route('https://warehouse1.indicia.org.uk/**', async route => {
      const url = new URL(route.request().url());

      if (url.pathname.endsWith('/ebms_app_species_list.xml')) {
        installedGroups.push(Number(url.searchParams.get('id')));
        await route.fulfill({ json: { data: [] } });
        return;
      }

      const speciesGroup = Number(
        url.searchParams.get('species_groups_filter')
      );
      const isCountryDefault =
        url.searchParams.get('location_code_filter') === 'FR' &&
        !url.searchParams.get('updated_on_filter');

      await route.fulfill({
        json: {
          data: isCountryDefault
            ? [
                {
                  id: speciesGroup,
                  type: 'list',
                  name:
                    speciesGroup === mothGroup
                      ? 'France moths'
                      : 'France butterflies',
                  species_groups: JSON.stringify([speciesGroup]),
                  location_code: 'FR',
                  taxa_count: '0',
                  updated_on: new Date().toISOString(),
                },
              ]
            : [],
        },
      });
    });

    await page.goto('/settings/country');
    await page.getByText('Europe', { exact: true }).click();
    await page.getByText('France', { exact: true }).click();
    await expect
      .poll(() => installedGroups.sort())
      .toEqual(mothsFavourite ? [butterflyGroup, mothGroup] : [butterflyGroup]);

    await page.goto('/settings/species-lists');
    await expect(
      page.getByText('France butterflies', { exact: true })
    ).toBeVisible();

    const mothList = page.getByText('France moths', { exact: true });

    if (mothsFavourite) {
      await expect(mothList).toBeVisible();
    } else {
      await expect(mothList).toHaveCount(0);
    }
  });
}
