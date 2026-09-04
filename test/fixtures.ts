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

  await page.route('https://warehouse1.indicia.org.uk/**', route =>
    route.fulfill({ json: { data: [], hits: { hits: [] } } })
  );
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
    const { db, locationsStore, mainStore, taxaStore, taxonListsStore } =
      window as any;
    const now = Date.now();

    await mainStore.save({
      id: '1',
      cid: 'user',
      data: {
        firstName: 'Test',
        lastName: 'Recorder',
        email: 'test@example.com',
        verified: true,
        profileFetched: true,
      },
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
};

export const test = base.extend<Fixtures>({
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
  },
});

export { expect } from '@playwright/test';
