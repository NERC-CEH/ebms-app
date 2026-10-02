import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { openSurvey, selectSpecies } from './utils';

const PROJECT_ID = '9002';
const PROJECT_NAME = 'Test recording project';
const now = new Date().toISOString();
const location = (
  id: string,
  name: string,
  type: string,
  parentId?: string
) => ({
  id,
  name,
  location_type_id: type,
  parent_id: parentId || null,
  lat: '51.5',
  lon: '-0.12',
  centroid_sref: '51.5 -0.12',
  centroid_sref_system: '4326',
  created_on: now,
  updated_on: now,
  created_by_id: 'another-recorder',
  boundary_geom: '',
});
const projectLocations = [
  location('1001', 'Project Transect', '777'),
  location('2001', 'Project Moth Trap', '18879'),
  { ...location('3001', 'Project Bait Site', '24555'), 'locAttr:428': '2' },
  location('4001', 'Project Count Site', '14'),
];
const section = location('1002', 'Project Section', '778', '1001');
const baitTrap = location('3002', 'Project Bait Trap', '24554', '3001');

async function prepareProjects(page: Page) {
  let joined = false;
  const group = (id: string, title: string, member: boolean) => ({
    values: {
      id,
      title,
      created_on: now,
      user_is_member: member ? 't' : null,
      joining_method: 'P',
    },
  });

  await page.route('https://warehouse1.indicia.org.uk/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith(`/groups/${PROJECT_ID}/users`)) {
      expect(route.request().method()).toBe('POST');
      joined = true;
      await route.fulfill({ json: {} });
      return;
    }

    if (path.endsWith('/groups')) {
      const existing = group('9001', 'Existing project', true);
      const project = group(PROJECT_ID, PROJECT_NAME, joined);
      await route.fulfill({
        json:
          url.searchParams.get('view') === 'joinable'
            ? joined
              ? []
              : [project]
            : joined
              ? [existing, project]
              : [existing],
      });
      return;
    }

    if (path.includes('/groups/') && path.endsWith('/locations')) {
      const docs = path.includes(`/${PROJECT_ID}/`) ? projectLocations : [];
      await route.fulfill({
        json: docs.map(doc => ({
          values: {
            ...doc,
            id: `link-${doc.id}`,
            group_id: PROJECT_ID,
            location_id: doc.id,
            location_name: doc.name,
            location_boundary_geom: doc.boundary_geom,
            location_lat: doc.lat,
            location_lon: doc.lon,
            location_created_on: now,
            location_updated_on: now,
            location_centroid_sref: doc.centroid_sref,
            location_centroid_sref_system: doc.centroid_sref_system,
          },
        })),
      });
      return;
    }

    if (path.includes('/locations/')) {
      const doc = projectLocations.find(
        item => item.id === path.split('/').pop()
      );
      expect(doc).toBeDefined();
      await route.fulfill({ json: { values: doc } });
      return;
    }

    if (path.endsWith('/locations')) {
      await route.fulfill({ json: [] });
      return;
    }

    if (
      path.endsWith('/ebms_countries_and_other_ttl_attr_profiles_for_app.xml')
    ) {
      await route.fulfill({
        json: {
          data: url.searchParams.get('updated_on_filter')
            ? []
            : [
                {
                  id: 9100,
                  type: 'list',
                  name: 'Project species',
                  species_groups: '[104,114]',
                  taxa_count: '2',
                  updated_on: now,
                  projects: `[${PROJECT_ID}]`,
                },
                {
                  id: 9200,
                  type: 'list',
                  name: 'Site species',
                  species_groups: '[104,114]',
                  taxa_count: '2',
                  updated_on: now,
                  locations: JSON.stringify(
                    projectLocations.map(item => item.id)
                  ),
                },
              ],
        },
      });
      return;
    }

    if (path.endsWith('/ebms_app_species_list.xml')) {
      const species =
        url.searchParams.get('id') === '9100'
          ? ([
              [100, 104, 'Vanessa cardui', 'Painted Lady'],
              [300, 114, 'Noctua pronuba', 'Large Yellow Underwing'],
            ] as const)
          : ([
              [200, 104, 'Aglais io', 'Peacock'],
              [400, 114, 'Campaea margaritaria', 'Light Emerald'],
            ] as const);
      await route.fulfill({
        json: {
          data: species.flatMap(
            ([id, taxonGroup, scientificName, commonName]) => [
              {
                taxa_taxon_list_id: String(id),
                preferred_taxa_taxon_list_id: String(id),
                taxon_group_id: String(taxonGroup),
                language_iso: 'lat',
                taxon: scientificName,
              },
              {
                taxa_taxon_list_id: String(id + 1),
                preferred_taxa_taxon_list_id: String(id),
                taxon_group_id: String(taxonGroup),
                language_iso: 'eng',
                taxon: commonName,
              },
            ]
          ),
        },
      });
      return;
    }

    const data = path.endsWith('/ebms_app_sections_list_2.xml')
      ? [section]
      : path.endsWith('/ebms_shared_locations.xml') &&
          url.searchParams.get('location_type_id') === '24554'
        ? [baitTrap]
        : [];
    await route.fulfill({ json: { data, hits: { hits: [] } } });
  });

  await page.evaluate(async () => {
    const { mainStore, groupsStore } = window as any;
    const user = (await mainStore.findAll()).find(
      (record: any) => record.cid === 'user'
    );
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
    );
    await mainStore.save({
      ...user,
      data: {
        ...user.data,
        indiciaUserId: '1',
        tokens: { access_token: `test.${payload}.test` },
      },
    });
    const app = (await mainStore.findAll()).find(
      (record: any) => record.cid === 'app'
    );
    await mainStore.save({
      ...app,
      data: { ...app.data, useDayFlyingMothsOnly: true },
    });
    await groupsStore.delete('fixture-project');
    await groupsStore.save({
      id: '9001',
      cid: 'existing-project',
      data: { title: 'Existing project', userIsMember: 't' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  });
  await page.reload();
  await expect(page.locator('#home-home')).toBeVisible();
}

const surveys = [
  {
    name: '15min Count',
    details: true,
    siteLink: 'Site',
    site: 'Project Count Site',
  },
  {
    name: '15min Single Species Count',
    details: false,
    siteLink: 'Site',
    site: 'Project Count Site',
  },
  {
    name: 'eBMS Transect',
    details: false,
    siteLink: 'Transect No transect',
    site: 'Project Transect',
  },
  {
    name: 'Moth survey',
    details: false,
    siteLink: 'Moth trap',
    site: 'Project Moth Trap',
  },
  {
    name: 'Bait-trap survey',
    details: false,
    siteLink: 'Site',
    site: 'Project Bait Site',
  },
];

for (const survey of surveys) {
  test(`${survey.name}: joins, persists and selects a project location`, async ({
    recordingPage: page,
  }) => {
    await prepareProjects(page);
    await openSurvey(page, survey.name);

    if (survey.name === '15min Single Species Count') {
      await selectSpecies(page, 'Painted', 'Painted Lady');
    }

    if (survey.details)
      await page.getByText('Additional Details', { exact: true }).click();

    const projectLink = page.getByRole('link', {
      name: 'Project',
      exact: true,
    });
    await expect(projectLink).toBeVisible();
    const detailsURL = page.url();
    await projectLink.click();
    const picker = page.locator('#precise-area-count-edit-group');
    await picker
      .locator('ion-segment-button')
      .filter({ hasText: 'All projects' })
      .click();
    await picker.getByRole('button', { name: 'Join', exact: true }).click();
    await expect(
      picker.getByRole('radio', { name: PROJECT_NAME })
    ).toBeVisible();
    await picker.getByRole('radio', { name: PROJECT_NAME }).press('Space');
    await expect(page).toHaveURL(detailsURL);
    await expect(
      page.getByRole('link', { name: `Project ${PROJECT_NAME}`, exact: true })
    ).toBeVisible();

    // Project selection uses the existing model autosave, which is debounced.
    await expect
      .poll(() =>
        page.evaluate(
          async ({ projectId, rememberProject }) => {
            const { samplesStore, mainStore } = window as any;
            const samples = await samplesStore.findAll();
            const app = (await mainStore.findAll()).find(
              (record: any) => record.cid === 'app'
            );
            return (
              samples.some(
                (sample: any) => sample.data.data.groupId === projectId
              ) &&
              (rememberProject
                ? app?.data.defaultGroupId === projectId
                : !app?.data.defaultGroupId)
            );
          },
          {
            projectId: PROJECT_ID,
            rememberProject: survey.name.startsWith('15min'),
          }
        )
      )
      .toBe(true);

    await page.reload();
    await expect(
      page.getByRole('link', { name: `Project ${PROJECT_NAME}`, exact: true })
    ).toBeVisible();
    if (survey.name === '15min Count') {
      await page.getByRole('button', { name: 'Back', exact: true }).click();
      await openSurvey(page, survey.name);
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByText('Add species', { exact: true }).click();
      await expect(
        page
          .locator('.search-result')
          .getByText('Painted Lady', { exact: true })
      ).toBeVisible();
      await page
        .locator('#precise-area-count-edit-taxa')
        .getByRole('button', { name: 'Back', exact: true })
        .click();
      await page.getByText('Additional Details', { exact: true }).click();
    }

    await page
      .getByRole('link', { name: survey.siteLink, exact: true })
      .click();

    const projectSite = page.getByText(survey.site, { exact: true });

    if (['eBMS Transect', 'Bait-trap survey'].includes(survey.name)) {
      await expect(projectSite).toBeVisible();
    } else {
      await expect(projectSite).not.toBeVisible();
    }

    if (survey.name === 'eBMS Transect') {
      await page
        .locator('ion-modal ion-segment-button')
        .filter({ hasText: 'Project' })
        .click();
      await page
        .locator('ion-modal ion-list > div')
        .filter({ hasText: survey.site })
        .click();
      await expect(
        page.getByRole('link', { name: `Project ${PROJECT_NAME}`, exact: true })
      ).toBeDisabled();
      await expect(page.getByText(PROJECT_NAME, { exact: true })).toBeVisible();
      await page.getByRole('link', { name: /^Sections \d+$/ }).click();
      await expect(
        page.getByText('Project Section', { exact: true })
      ).toBeVisible();
      await page.getByText('Project Section', { exact: true }).click();
      await page.getByText('Add species', { exact: true }).click();
    } else {
      await page
        .locator('ion-modal ion-segment-button')
        .filter({ hasText: 'Project' })
        .click();
      await expect(page.getByText(survey.site, { exact: true })).toBeVisible();
      for (const other of projectLocations.filter(
        item => item.name !== survey.site
      )) {
        await expect(
          page.getByText(other.name, { exact: true })
        ).not.toBeVisible();
      }
      await page
        .getByText(survey.site, { exact: true })
        .evaluate(element => (element as HTMLElement).click());
      await expect(
        page.getByRole('link', {
          name: `${survey.siteLink} ${survey.site}`,
          exact: true,
        })
      ).toBeVisible();

      if (survey.name === 'Bait-trap survey') {
        await page
          .locator('#survey-bait-trap-detail')
          .getByRole('button', { name: 'Next' })
          .click();
        await page.getByText('Add trap visit', { exact: true }).click();
        await page.getByText('Project Bait Trap', { exact: true }).click();
        await page
          .locator('#survey-bait-trap-trap-detail')
          .getByRole('button', { name: 'Next' })
          .click();
        await page.getByText('Add species', { exact: true }).click();
      } else if (survey.name === 'Moth survey') {
        await page
          .locator('#survey-moth-detail')
          .getByRole('button', { name: 'Next' })
          .click();
        await page
          .getByRole('button', { name: 'Species', exact: true })
          .click();
      } else if (survey.name === '15min Count') {
        await page
          .locator('#survey-area-count-detail-edit')
          .getByRole('button', { name: 'Back', exact: true })
          .click();
        await page.getByText('Add species', { exact: true }).click();
      } else {
        return;
      }
    }

    const siteSpecies =
      survey.name === 'Moth survey' ? 'Light Emerald' : 'Peacock';
    const projectSpecies =
      survey.name === 'Moth survey' ? 'Large Yellow Underwing' : 'Painted Lady';
    await expect(
      page.locator('.search-result').getByText(siteSpecies, { exact: true })
    ).toBeVisible();
    if (survey.name !== '15min Single Species Count') {
      const wrongGroupSpecies =
        survey.name === 'Moth survey' ? 'Peacock' : 'Light Emerald';
      await expect(
        page
          .locator('.search-result')
          .getByText(wrongGroupSpecies, { exact: true })
      ).not.toBeVisible();
    }
    await expect(
      page.locator('.search-result').getByText(projectSpecies, { exact: true })
    ).not.toBeVisible();
    await page
      .getByRole('searchbox', { name: 'search text' })
      .fill(projectSpecies);
    await expect(page.getByText('No species found')).toBeVisible();
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(
      page.locator('.search-result').getByText(projectSpecies, { exact: true })
    ).toBeVisible();
  });
}

for (const survey of surveys) {
  test(`${survey.name}: only count surveys prefill the project`, async ({
    recordingPage: page,
  }) => {
    await prepareProjects(page);
    await page.evaluate(async () => {
      const store = (window as any).mainStore;
      const app = (await store.findAll()).find(
        (record: any) => record.cid === 'app'
      );
      await store.save({
        ...app,
        data: { ...app.data, defaultGroupId: '9001' },
      });
    });
    await page.reload();
    await expect(page.locator('#home-home')).toBeVisible();
    await openSurvey(page, survey.name);

    if (survey.name === '15min Single Species Count') {
      await selectSpecies(page, 'Painted', 'Painted Lady');
    }

    if (survey.details)
      await page.getByText('Additional Details', { exact: true }).click();

    const projectLabel = survey.name.startsWith('15min')
      ? 'Project Existing project'
      : 'Project';
    await expect(
      page.getByRole('link', { name: projectLabel, exact: true })
    ).toBeVisible();
  });
}

for (const survey of surveys.filter(item =>
  ['eBMS Transect', 'Bait-trap survey'].includes(item.name)
)) {
  test(`${survey.name}: lists accessible sites and filters the selected project`, async ({
    recordingPage: page,
  }) => {
    await page.evaluate(async surveyName => {
      const { db, groupsStore, locationsStore } = window as any;
      const siteCid =
        surveyName === 'eBMS Transect' ? 'test-transect' : 'test-bait-site';
      const site = (await locationsStore.findAll()).find(
        (record: any) => record.cid === siteCid
      );
      await groupsStore.save([
        {
          id: '9001',
          cid: 'project-a',
          data: { title: 'Project A', userIsMember: 't' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '9002',
          cid: 'project-b',
          data: { title: 'Project B', userIsMember: 't' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
      await locationsStore.save([
        {
          ...site,
          id: '5001',
          cid: 'other-project-site',
          data: { ...site.data, name: 'Other project site' },
        },
        {
          ...site,
          id: '5002',
          cid: 'personal-site',
          data: { ...site.data, name: 'Personal site' },
        },
      ]);
      await db.query({
        sql: 'INSERT INTO groups_locations (group_cid, location_cid) VALUES (?, ?), (?, ?)',
        params: ['project-a', siteCid, 'project-b', 'other-project-site'],
      });
    }, survey.name);
    await page.reload();
    await expect(page.locator('#home-home')).toBeVisible();
    await page.context().setOffline(true);
    await openSurvey(page, survey.name);
    await page.getByRole('link', { name: 'Project', exact: true }).click();
    await page
      .getByRole('radio', { name: 'Project A', exact: true })
      .press('Space');
    await page
      .getByRole('link', { name: survey.siteLink, exact: true })
      .click();
    await expect(
      page.getByText('Personal site', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('Other project site', { exact: true })
    ).toBeVisible();
    const projectSite =
      survey.name === 'eBMS Transect' ? 'Test Transect' : 'Test Bait Site';
    await expect(page.getByText(projectSite, { exact: true })).toBeVisible();
    await page
      .locator('ion-modal ion-segment-button')
      .filter({ hasText: 'Project' })
      .click();
    await expect(page.getByText(projectSite, { exact: true })).toBeVisible();
    await expect(
      page.getByText('Other project site', { exact: true })
    ).not.toBeVisible();
    await expect(
      page.getByText('Personal site', { exact: true })
    ).not.toBeVisible();
  });
}

test('creates a moth trap linked to the selected project', async ({
  recordingPage: page,
}) => {
  await prepareProjects(page);
  await page.evaluate(async () => {
    const { mainStore } = window as any;
    const app = (await mainStore.findAll()).find(
      (record: any) => record.cid === 'app'
    );
    await mainStore.save({
      ...app,
      data: { ...app.data, defaultGroupId: '9001' },
    });
  });
  await page.reload();
  await expect(page.locator('#home-home')).toBeVisible();

  const trap = {
    ...location('2002', 'New project trap', '18879'),
    'locAttr:306': [] as { value: string }[],
    'locAttr:330': '19306',
  };
  let created = false;
  let linked = false;
  let creations = 0;
  let linkAttempts = 0;
  let createdExternalKey: string | undefined;
  let duplicateSubmissions = 0;

  await page.route(/\/services\/rest\/locations(\?.*)?$/, async route => {
    if (route.request().method() === 'POST') {
      const { values } = route.request().postDataJSON();
      expect(values.name).toBe(trap.name);
      expect(values.location_type_id).toBe('18879');
      expect(values.centroid_sref).toMatch(/^-?[\d.]+ -?[\d.]+$/);
      expect(values['locAttr:306']).toHaveLength(1);
      expect(values).not.toHaveProperty('group_id');
      expect(values.external_key).toEqual(expect.any(String));

      // The warehouse rejects a retry with the same external key.
      if (created && values.external_key === createdExternalKey) {
        duplicateSubmissions++;
        await route.fulfill({
          status: 409,
          json: { duplicate_of: { id: trap.id } },
        });
        return;
      }

      trap['locAttr:306'] = values['locAttr:306'].map((value: string) => ({
        value,
      }));
      if (!values.id) creations++;
      else expect(values.id).toBe(trap.id);
      createdExternalKey = values.external_key;
      created = true;
      await route.fulfill({ json: { values: trap } });
      return;
    }

    await route.fulfill({ json: created ? [{ values: trap }] : [] });
  });
  await page.route(`**/services/rest/locations/${trap.id}?*`, route =>
    route.fulfill({ json: { values: trap } })
  );
  await page.route('**/services/rest/groups/9001/locations', async route => {
    if (route.request().method() === 'POST') {
      expect(created).toBe(true);
      expect(route.request().postDataJSON()).toEqual({
        values: { id: trap.id },
      });
      linkAttempts++;
      if (linkAttempts === 1) {
        await route.fulfill({ status: 503, json: { message: 'Link failed' } });
        return;
      }
      linked = true;
      await route.fulfill({ json: {} });
      return;
    }

    await route.fulfill({
      json: linked
        ? [
            {
              values: {
                ...trap,
                id: `link-${trap.id}`,
                group_id: '9001',
                location_id: trap.id,
                location_name: trap.name,
                location_boundary_geom: trap.boundary_geom,
                location_lat: trap.lat,
                location_lon: trap.lon,
                location_created_on: trap.created_on,
                location_updated_on: trap.updated_on,
                location_centroid_sref: trap.centroid_sref,
                location_centroid_sref_system: trap.centroid_sref_system,
              },
            },
          ]
        : [],
    });
  });

  await openSurvey(page, 'Moth survey');
  await page.getByRole('link', { name: 'Project', exact: true }).click();
  const picker = page.locator('#precise-area-count-edit-group');
  await picker
    .locator('ion-segment-button')
    .filter({ hasText: 'All projects' })
    .click();
  await expect(
    picker.getByRole('button', { name: 'Join', exact: true })
  ).toBeVisible();
  await picker
    .locator('ion-segment-button')
    .filter({ hasText: 'My projects' })
    .click();
  await page
    .getByRole('radio', { name: 'Existing project', exact: true })
    .press('Space');
  await page.getByRole('link', { name: 'Moth trap', exact: true }).click();
  await page
    .locator('#moth-sites')
    .getByRole('button', { name: 'Add' })
    .click();

  const projectButton = page.getByRole('button', {
    name: 'Existing project Project',
    exact: true,
  });
  await expect(projectButton).toBeVisible();
  await projectButton.click();
  await expect(
    page.getByRole('option', { name: PROJECT_NAME, exact: true })
  ).toHaveCount(0);
  await page.getByRole('option', { name: 'None', exact: true }).click();
  await page.getByRole('button', { name: 'Project', exact: true }).click();
  await page
    .getByRole('option', { name: 'Existing project', exact: true })
    .click();

  await page
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill(trap.name);
  await page.getByText('Location', { exact: true }).click();
  const coordinates = page.locator('ion-modal .location-input-attr input');
  await page.locator('ion-modal canvas.mapboxgl-canvas').click();
  await expect(coordinates).not.toHaveValue('');
  await page
    .locator('ion-modal .location-input-attr')
    .getByRole('button', { name: 'back', exact: true })
    .click();

  await page.getByRole('button', { name: 'Type', exact: true }).click();
  await page
    .getByRole('option', { name: 'LED funnel trap', exact: true })
    .click();
  await page.getByRole('button', { name: 'Add lamp', exact: true }).click();
  await page.getByRole('button', { name: 'Type', exact: true }).click();
  await page
    .getByRole('option', {
      name: 'LED → Ledstrip → 395-405 SMD 2835',
      exact: true,
    })
    .click();
  await page
    .locator('ion-modal')
    .getByRole('button', { name: 'Back', exact: true })
    .click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect.poll(() => linkAttempts).toBe(1);
  await expect(
    page.getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();
  await expect(page.getByText('Link failed', { exact: true })).toBeVisible();
  await expect(page.locator('ion-loading')).not.toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => linked).toBe(true);
  expect(creations).toBe(1);
  expect(duplicateSubmissions).toBe(1);
  await page
    .locator('ion-modal ion-segment-button')
    .filter({ hasText: 'Project' })
    .click();
  await expect(page.getByText(trap.name, { exact: true })).toBeVisible();
  const savedTrap = await page.evaluate(async () =>
    (await (window as any).locationsStore.findAll()).find(
      (record: any) => record.id === '2002'
    )
  );
  expect(savedTrap.data['locAttr:330']).toBe(trap['locAttr:330']);
  expect(savedTrap.data['locAttr:306']).toHaveLength(1);
});
