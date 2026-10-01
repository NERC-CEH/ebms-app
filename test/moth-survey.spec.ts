import { test, expect } from './fixtures';
import { openSurvey, selectSpecies } from './utils';

test('shows user-created project traps only in the project tab', async ({
  recordingPage: page,
}) => {
  await page.evaluate(async () => {
    const { db, mainStore, locationsStore, groupsStore } = window as any;
    const records = await mainStore.findAll();
    const user = records.find((record: any) => record.cid === 'user');
    const app = records.find((record: any) => record.cid === 'app');
    const trap = (await locationsStore.findAll()).find(
      (record: any) => record.cid === 'test-moth-trap'
    );

    await mainStore.save([
      { ...user, data: { ...user.data, indiciaUserId: '1' } },
      { ...app, data: { ...app.data, defaultGroupId: '9001' } },
    ]);
    await locationsStore.save([
      { ...trap, data: { ...trap.data, createdById: '1' } },
      {
        ...trap,
        id: '2002',
        cid: 'personal-moth-trap',
        data: { ...trap.data, name: 'Personal trap', createdById: '1' },
      },
    ]);
    await groupsStore.save({
      id: '9001',
      cid: 'test-project',
      data: { title: 'Test project', userIsMember: 't' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await db.query({
      sql: 'INSERT INTO groups_locations (group_cid, location_cid) VALUES (?, ?)',
      params: ['test-project', trap.cid],
    });
  });
  await page.reload();
  await expect(page.locator('#home-home')).toBeVisible();
  // Keep the seeded sites intact instead of refreshing them from the server.
  await page.context().setOffline(true);
  await openSurvey(page, 'Moth survey');
  await expect(
    page.getByRole('link', { name: 'Project', exact: true })
  ).toBeVisible();
  await page.getByRole('link', { name: 'Project', exact: true }).click();
  await page
    .getByRole('radio', { name: 'Test project', exact: true })
    .press('Space');
  await page.getByRole('link', { name: 'Moth trap', exact: true }).click();

  const sites = page.locator('ion-modal');
  await expect(sites.getByText('Personal trap', { exact: true })).toBeVisible();
  await expect(
    sites.getByText('Test Moth Trap', { exact: true })
  ).not.toBeVisible();

  await sites
    .locator('ion-segment-button')
    .filter({ hasText: 'Project' })
    .click();
  await expect(
    sites.getByText('Test Moth Trap', { exact: true })
  ).toBeVisible();
  await expect(
    sites.getByText('Personal trap', { exact: true })
  ).not.toBeVisible();
});

test('completes a moth survey with a saved trap and species', async ({
  recordingPage,
}) => {
  await openSurvey(recordingPage, 'Moth survey');

  const details = recordingPage.locator('#survey-moth-detail');
  await expect(details.getByText('Trap start')).toBeVisible();
  await expect(details.getByText('Trap end')).toBeVisible();

  await details.getByText('Moth trap', { exact: true }).click();
  await recordingPage
    .getByText('Test Moth Trap', { exact: true })
    .evaluate(element => (element as HTMLElement).click());
  await expect(details.getByText('Test Moth Trap')).toBeVisible();
  await expect(
    details.getByText('Weather', { exact: true }).first()
  ).toBeVisible();

  await details.getByRole('button', { name: 'Next' }).click();
  await expect(recordingPage.locator('#survey-moth-home')).toBeVisible();
  await expect(recordingPage.getByText('No species added')).toBeVisible();

  await recordingPage.getByRole('button', { name: 'Species' }).click();
  await selectSpecies(recordingPage, 'Large Yellow', 'Large Yellow Underwing');
  await expect(
    recordingPage.locator('#list').last().getByText('Large Yellow Underwing')
  ).toBeVisible();

  await recordingPage
    .locator('#list')
    .last()
    .getByText('Large Yellow Underwing')
    .click();
  await expect(recordingPage.getByText('Count inside')).toBeVisible();
  await expect(recordingPage.getByText('Count outside')).toBeVisible();
  await recordingPage
    .locator('#moth-survey-edit-occurrence')
    .getByRole('button', { name: 'Back' })
    .click();

  await recordingPage
    .locator('#survey-moth-home')
    .getByRole('button', { name: 'Finish' })
    .click();
  await expect(
    recordingPage.locator('#home-user-surveys').getByText('Moth survey')
  ).toBeVisible();
});
