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

for (const failure of [
  'project',
  'location',
  'location-request',
  'attributes',
  'personal',
]) {
  test(`moth refresh survives a failed ${failure} response`, async ({
    recordingPage: page,
  }) => {
    await page.evaluate(async () => {
      const { db, groupsStore, locationsStore } = window as any;
      await groupsStore.save({
        id: '9000',
        cid: 'fixture-project',
        data: { title: 'Fixture project', userIsMember: 't' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      const trap = (await locationsStore.findAll()).find(
        (record: any) => record.cid === 'test-moth-trap'
      );
      await locationsStore.save({
        ...trap,
        id: '2002',
        cid: 'personal-recovery-trap',
        data: { ...trap.data, name: 'Personal recovery trap' },
      });
      await db.query({
        sql: 'INSERT INTO groups_locations (group_cid, location_cid) VALUES (?, ?)',
        params: ['fixture-project', trap.cid],
      });
    });
    await page.reload();
    await expect(page.locator('#home-home')).toBeVisible();
    const expectPersonalRefresh = [
      'project',
      'location',
      'location-request',
    ].includes(failure);
    let personalRequests = 0;
    let projectLocationRequests = 0;
    await page.route('https://warehouse1.indicia.org.uk/**', async route => {
      const url = new URL(route.request().url());
      const path = url.pathname;

      if (path.endsWith('/groups/9000/locations')) {
        await route.fulfill(
          failure === 'project'
            ? { status: 503, json: {} }
            : {
                json: [
                  {
                    values: {
                      id: 'link-2001',
                      location_id: '2001',
                      location_name: 'Test Moth Trap',
                      location_type_id: '18879',
                      location_boundary_geom: '',
                      location_lat: '51.5',
                      location_lon: '-0.12',
                      location_created_on: new Date().toISOString(),
                      location_updated_on: new Date().toISOString(),
                      location_centroid_sref: '51.5 -0.12',
                      location_centroid_sref_system: '4326',
                    },
                  },
                ],
              }
        );
        return;
      }

      if (path.endsWith('/locations/2001')) {
        projectLocationRequests++;

        if (failure === 'location-request') {
          await route.fulfill({
            status: 403,
            json: { message: 'Location access denied' },
          });
          return;
        }

        const values = await page.evaluate(async () => {
          const trap = (await (window as any).locationsStore.findAll()).find(
            (record: any) => record.id === '2001'
          );
          return {
            ...trap.data,
            id: trap.id,
            lat: '51.5',
            lon: '-0.12',
            createdOn: new Date(trap.createdAt).toISOString(),
            updatedOn: new Date(trap.updatedAt).toISOString(),
          };
        });
        if (failure === 'location') values.id = 'wrong-id';
        if (failure === 'attributes')
          values['locAttr:306'] = [{ value: 'invalid JSON' }];
        await route.fulfill({ json: { values } });
        return;
      }

      if (path.endsWith('/locations')) {
        personalRequests++;
        if (failure === 'personal' && personalRequests === 1) {
          await route.fulfill({ status: 503, json: {} });
          return;
        }
        const values = await page.evaluate(async () => {
          const trap = (await (window as any).locationsStore.findAll()).find(
            (record: any) => record.id === '2002'
          );
          return {
            ...trap.data,
            id: trap.id,
            lat: '51.5',
            lon: '-0.12',
            createdOn: new Date(trap.createdAt).toISOString(),
            updatedOn: new Date(trap.updatedAt).toISOString(),
          };
        });
        if (expectPersonalRefresh) values.name = 'Refreshed personal trap';

        await route.fulfill({ json: [{ values }] });
        return;
      }

      await route.fulfill({ json: { data: [] } });
    });
    await openSurvey(page, 'Moth survey');
    const locationLink = page.getByRole('link', {
      name: 'Moth trap',
      exact: true,
    });
    await locationLink.click();
    const sites = page.locator('#moth-sites');
    await expect.poll(() => personalRequests).toBe(1);
    await expect(sites.locator('ion-spinner')).toHaveCount(0);
    await expect(page.locator('ion-loading')).not.toBeVisible();
    expect(projectLocationRequests).toBe(failure === 'project' ? 0 : 1);
    await expect(
      page.getByText(
        expectPersonalRefresh
          ? 'Refreshed personal trap'
          : 'Personal recovery trap',
        { exact: true }
      )
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await (window as any).locationsStore.findAll()).some(
            (record: any) => record.id === '2001'
          )
        )
      )
      .toBe(true);

    if (failure === 'personal') {
      await sites.getByRole('button', { name: 'Back', exact: true }).click();
      await locationLink.click();
      await expect.poll(() => personalRequests).toBe(2);
      await expect(sites.locator('ion-spinner')).toHaveCount(0);
    }
  });
}

for (const source of ['project', 'personal']) {
  test(`malformed ${source} lamps ${source === 'project' ? 'do not block valid locations' : 'still report an error'}`, async ({
    recordingPage: page,
  }) => {
    await page.evaluate(async () => {
      const { db, groupsStore, locationsStore } = window as any;
      const now = Date.now();
      await groupsStore.save({
        id: '9000',
        cid: 'fixture-project',
        data: { title: 'Fixture project', userIsMember: 't' },
        createdAt: now,
        updatedAt: now,
      });
      const trap = (await locationsStore.findAll()).find(
        (record: any) => record.cid === 'test-moth-trap'
      );
      await locationsStore.save({
        ...trap,
        id: '2002',
        cid: 'personal-lamp-test-trap',
        data: { ...trap.data, name: 'Personal trap before refresh' },
      });
      await db.query({
        sql: 'INSERT INTO groups_locations (group_cid, location_cid) VALUES (?, ?)',
        params: ['fixture-project', trap.cid],
      });
    });
    await page.reload();
    await expect(page.locator('#home-home')).toBeVisible();

    const now = new Date().toISOString();
    const groupLocation = {
      location_type_id: '18879',
      location_boundary_geom: '',
      location_lat: '51.5',
      location_lon: '-0.12',
      location_created_on: now,
      location_updated_on: now,
      location_created_by_id: '2',
      location_centroid_sref: '51.5 -0.12',
      location_centroid_sref_system: '4326',
    };
    const invalidLamps = [{ value: 'invalid JSON' }];
    let personalRequests = 0;
    await page.route('https://warehouse1.indicia.org.uk/**', async route => {
      const path = new URL(route.request().url()).pathname;

      if (path.endsWith('/groups/9000/locations')) {
        const docs = [
          {
            ...groupLocation,
            id: 'link-2001',
            location_id: '2001',
            location_name: 'Malformed project trap',
            'locAttr:306': source === 'project' ? invalidLamps : [],
          },
          {
            ...groupLocation,
            id: 'link-2003',
            location_id: '2003',
            location_name: 'Healthy project trap',
            'locAttr:306': [],
          },
        ];
        await route.fulfill({ json: docs.map(values => ({ values })) });
        return;
      }

      if (path.endsWith('/locations')) {
        personalRequests++;
        await route.fulfill({
          json: [
            {
              values: {
                id: '2002',
                name: 'Refreshed personal trap',
                location_type_id: '18879',
                lat: '51.5',
                lon: '-0.12',
                centroid_sref: '51.5 -0.12',
                centroid_sref_system: '4326',
                created_on: now,
                updated_on: now,
                created_by_id: '1',
                'locAttr:306': source === 'personal' ? invalidLamps : [],
              },
            },
          ],
        });
        return;
      }

      await route.fulfill({
        json: path.endsWith('/groups') ? [] : { data: [] },
      });
    });
    await openSurvey(page, 'Moth survey');
    await page.getByRole('link', { name: 'Project', exact: true }).click();
    await page
      .getByRole('radio', { name: 'Fixture project', exact: true })
      .press('Space');
    await page.getByRole('link', { name: 'Moth trap', exact: true }).click();
    await expect.poll(() => personalRequests).toBe(1);
    await expect(page.locator('#moth-sites ion-spinner')).toHaveCount(0);
    await expect(page.locator('ion-loading')).not.toBeVisible();

    if (source === 'personal') {
      await expect(
        page.getByText('Could not parse a lamp', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText('Personal trap before refresh', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText('Refreshed personal trap', { exact: true })
      ).not.toBeVisible();
      return;
    }

    await expect(
      page.getByText('Refreshed personal trap', { exact: true })
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await (window as any).locationsStore.findAll())
            .filter((record: any) => record.data.locationTypeId === '18879')
            .map((record: any) => record.id)
            .sort()
        )
      )
      .toEqual(['2002', '2003']);
    await page
      .locator('ion-modal ion-segment-button')
      .filter({ hasText: 'Project' })
      .click();
    await expect(
      page.getByText('Healthy project trap', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Malformed project trap', { exact: true })
    ).not.toBeVisible();
  });
}
