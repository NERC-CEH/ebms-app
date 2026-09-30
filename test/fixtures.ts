import { test as base, expect, type Page } from '@playwright/test';

export async function completeFirstRun(page: Page) {
  await page.goto('/');
  await page.getByText('English', { exact: true }).click();
  await page.getByText('Elsewhere', { exact: true }).click();

  const nextButton = page
    .locator('#welcome-page ion-footer')
    .getByRole('button');

  for (let slide = 0; slide < 5; slide++) {
    await expect(nextButton).toBeVisible();
    await nextButton.click();
  }

  await expect(page.locator('#home-home')).toBeVisible();
  // Setup state must be saved before fixtures seed data and reload the app.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const app = (await (window as any).mainStore.findAll()).find(
          (record: any) => record.cid === 'app'
        );
        return !!(
          app?.data.language &&
          app.data.country &&
          app.data.showedWelcome
        );
      })
    )
    .toBe(true);
}

async function mockRemoteReads(page: Page) {
  await page.addInitScript(() => {
    const removeWebpackOverlay = () =>
      document.querySelector('#webpack-dev-server-client-overlay')?.remove();

    window.addEventListener('DOMContentLoaded', () => {
      removeWebpackOverlay();
      new MutationObserver(removeWebpackOverlay).observe(document.body, {
        childList: true,
      });
    });
  });

  await page.route('https://warehouse1.indicia.org.uk/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const isLocationList = path.endsWith('/locations');
    const locationType = path.endsWith('/ebms_app_sites_list_2.xml')
      ? '777'
      : path.endsWith('/ebms_app_sections_list_2.xml')
        ? '778'
        : url.searchParams.get('location_type_id');

    if (isLocationList || locationType) {
      const locations = await page.evaluate(async type => {
        const records = await (window as any).locationsStore.findAll();
        return records
          .filter((record: any) => record.data.locationTypeId === type)
          .map((record: any) => ({
            ...record.data,
            id: record.id,
            lat: String(record.data.location.latitude),
            lon: String(record.data.location.longitude),
            createdOn: new Date(record.createdAt).toISOString(),
            updatedOn: new Date(record.updatedAt).toISOString(),
            attrLocation428: record.data['locAttr:428'],
          }));
      }, locationType);
      await route.fulfill({
        json: isLocationList
          ? locations.map((values: Record<string, unknown>) => ({ values }))
          : { data: locations },
      });
      return;
    }

    await route.fulfill({
      json: path.endsWith('/groups') ? [] : { data: [], hits: { hits: [] } },
    });
  });
  await page.route('https://api.openweathermap.org/**', route =>
    route.fulfill({
      json: {
        main: { temp: 20 },
        wind: { speed: 1, deg: 0 },
        clouds: { all: 20 },
        data: [{ temp: 20, wind_speed: 1, wind_deg: 0, clouds: 20 }],
      },
    })
  );
}

async function seedRecordingData(page: Page) {
  await page.evaluate(async () => {
    const {
      db,
      locationsStore,
      mainStore,
      groupsStore,
      taxaStore,
      taxonListsStore,
    } = window as any;
    const now = Date.now();
    const tokenLifetimeSeconds = 7 * 24 * 60 * 60;
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(now / 1000) + tokenLifetimeSeconds })
    );

    await mainStore.save({
      id: '1',
      cid: 'user',
      data: {
        firstName: 'Test',
        lastName: 'Recorder',
        email: 'test@example.com',
        verified: true,
        profileFetched: true,
        indiciaUserId: '1',
        tokens: { access_token: `test.${payload}.test` },
      },
      createdAt: now,
      updatedAt: now,
    });

    // Avoid unrelated first-login project sync racing survey-specific mocks.
    await groupsStore.save({
      id: '9000',
      cid: 'fixture-project',
      data: { title: 'Fixture project', userIsMember: null },
      createdAt: now,
      updatedAt: now,
    });

    await taxonListsStore.save({
      cid: 'test-list',
      data: {
        id: 1,
        type: 'list',
        title: 'Test butterflies',
        taxonGroups: [104, 114],
        size: 3,
      },
      createdAt: now,
      updatedAt: now,
    });

    await db.query({
      sql: `INSERT OR REPLACE INTO taxa (
        id, list_cid, taxon_group_id, preferred_taxa_taxon_list_id,
        parent_id, external_key, language_iso, taxon, data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        100,
        'test-list',
        104,
        100,
        null,
        null,
        'lat',
        'Vanessa cardui',
        '{}',
        101,
        'test-list',
        104,
        100,
        null,
        null,
        'eng',
        'Painted Lady',
        '{}',
        200,
        'test-list',
        104,
        200,
        null,
        null,
        'lat',
        'Aglais io',
        '{}',
        201,
        'test-list',
        104,
        200,
        null,
        null,
        'eng',
        'Peacock',
        '{}',
        300,
        'test-list',
        114,
        300,
        null,
        null,
        'lat',
        'Noctua pronuba',
        '{}',
        301,
        'test-list',
        114,
        300,
        null,
        null,
        'eng',
        'Large Yellow Underwing',
        '{}',
      ],
    });

    const location = (id: string, cid: string, data: Record<string, any>) => ({
      id,
      cid,
      data: {
        centroidSref: '51.5 -0.12',
        centroidSrefSystem: '4326',
        createdById: '1',
        location: { latitude: 51.5, longitude: -0.12 },
        ...data,
      },
      createdAt: now,
      updatedAt: now,
      syncedAt: now,
    });

    await locationsStore.save([
      location('1001', 'test-transect', {
        name: 'Test Transect',
        locationTypeId: '777',
      }),
      location('1002', 'test-transect-section-1', {
        name: 'Section 1',
        code: 'Section 1',
        parentId: '1001',
        locationTypeId: '778',
      }),
      location('1003', 'test-transect-section-2', {
        name: 'Section 2',
        code: 'Section 2',
        parentId: '1001',
        locationTypeId: '778',
      }),
      location('2001', 'test-moth-trap', {
        name: 'Test Moth Trap',
        locationTypeId: '18879',
        'locAttr:306': [],
        'locAttr:330': '19306',
      }),
      location('3001', 'test-bait-site', {
        name: 'Test Bait Site',
        locationTypeId: '24555',
        'locAttr:428': '2',
      }),
      location('3002', 'test-bait-trap', {
        name: 'Canopy Trap',
        parentId: '3001',
        locationTypeId: '24554',
      }),
    ]);

    await taxaStore.ready;
  });
}

type Fixtures = {
  homePage: Page;
  recordingPage: Page;
  missingTranslationKeys: void;
};

export const test = base.extend<Fixtures>({
  missingTranslationKeys: [
    async ({ page }, use) => {
      const missingKeys = new Set<string>();
      page.on('console', message => {
        // i18next also reports dynamic names and React markup, not just app keys.
        const match = message.text().match(/^🇬🇧: (\w+\.[\w.]+)$/);
        if (match) missingKeys.add(match[1]);
      });

      await use();

      expect([...missingKeys]).toEqual([]);
    },
    { auto: true },
  ],

  homePage: async ({ page }, use) => {
    await mockRemoteReads(page);
    await completeFirstRun(page);
    await use(page);
  },

  recordingPage: async ({ homePage }, use) => {
    await seedRecordingData(homePage);
    await homePage.reload();
    await expect(homePage.locator('#home-home')).toBeVisible();
    await homePage.evaluate(() => (window as any).testing.GPS.mock());
    await use(homePage);
    await homePage.unrouteAll({ behavior: 'ignoreErrors' });
  },
});

export { expect } from '@playwright/test';
