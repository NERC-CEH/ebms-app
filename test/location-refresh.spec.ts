import { test, expect } from './fixtures';
import { openSurvey } from './utils';

const REFRESH_INTERVAL = 30 * 60 * 1000;
const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

const surveys = [
  { name: '15min Count', link: 'Site', pageId: 'sites', details: true },
  { name: 'Moth survey', link: 'Moth trap', pageId: 'moth-sites' },
  { name: 'Bait-trap survey', link: 'Site', pageId: 'bait-trap-sites' },
  {
    name: 'eBMS Transect',
    link: 'Transect No transect',
    pageId: 'transect-location',
  },
];

for (const survey of surveys) {
  test(`${survey.name}: caches location refreshes for the session`, async ({
    recordingPage: page,
  }) => {
    let refreshes = 0;
    const now = Date.now();
    await page.clock.setFixedTime(now);

    await page.route('https://warehouse1.indicia.org.uk/**', async route => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const isLocationList = path.endsWith('/locations');
      const isTransectList = path.endsWith('/ebms_app_sites_list_2.xml');
      const isBaitSiteList =
        path.endsWith('/ebms_shared_locations.xml') &&
        url.searchParams.get('location_type_id') === '24555';

      if (isLocationList || isTransectList || isBaitSiteList) refreshes++;

      await route.fulfill({
        json: isLocationList || path.endsWith('/groups') ? [] : { data: [] },
      });
    });

    await page.evaluate(async tokenLifetime => {
      const { mainStore, groupsStore } = window as any;
      const user = (await mainStore.findAll()).find(
        (record: any) => record.cid === 'user'
      );
      const payload = btoa(
        JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + tokenLifetime,
        })
      );
      await mainStore.save({
        ...user,
        data: {
          ...user.data,
          tokens: { access_token: `test.${payload}.test` },
        },
      });
      // Avoid the unrelated first-time project sync refreshing all locations.
      await groupsStore.save({
        id: '9001',
        cid: 'test-project',
        data: { title: 'Test project', userIsMember: null },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }, TOKEN_LIFETIME_SECONDS);
    await page.reload();
    await expect(page.locator('#home-home')).toBeVisible();
    await openSurvey(page, survey.name);

    if (survey.details) {
      await page.getByText('Additional Details', { exact: true }).click();
    }

    const locationLink = page.getByRole('link', {
      name: survey.link,
      exact: true,
    });
    const locationPage = page.locator(`#${survey.pageId}`);
    const detailsURL = page.url();

    const openLocations = async (expectedRefreshes: number) => {
      await locationLink.click();
      await expect(locationPage).toBeVisible();
      await expect.poll(() => refreshes).toBe(expectedRefreshes);
      await expect(locationPage.locator('ion-spinner')).toHaveCount(0);
      await expect(page.locator('ion-loading')).not.toBeVisible();
      await expect(
        locationPage.getByRole('button', { name: 'Refresh', exact: true })
      ).toHaveCount(0);
      await locationPage.getByRole('button', { name: 'Back' }).click();
      await expect(page).toHaveURL(detailsURL);
      expect(refreshes).toBe(expectedRefreshes);
    };

    await openLocations(1);
    await openLocations(1);

    await page.clock.setFixedTime(now + REFRESH_INTERVAL + 1);
    await openLocations(2);

    await page.reload();
    await expect(locationLink).toBeVisible();
    await openLocations(3);
  });
}
