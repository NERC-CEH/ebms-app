import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { openSurvey } from './utils';

test('shows translated account validation', async ({ homePage }) => {
  await homePage.goto('/user/login');
  await homePage.getByPlaceholder('Email').fill('invalid');
  await homePage.getByPlaceholder('Password').fill('test');
  await homePage.getByRole('button', { name: 'Sign in' }).click();

  await expect(homePage.getByText('Please fill in')).toBeVisible();
});

async function mockTrainingProfile(page: Page, training: boolean) {
  const account = { training, failUpdates: false, updates: [] as boolean[] };

  await page.route('**/user/1?_format=json', async route => {
    if (route.request().method() === 'PATCH') {
      const payload = route.request().postDataJSON();
      const value = payload.field_training[0].value;
      expect(payload).toEqual({ field_training: [{ value }] });
      account.updates.push(value);

      if (account.failUpdates) {
        await route.fulfill({
          status: 503,
          json: { message: 'Training update failed' },
        });
        return;
      }

      account.training = value;
    }

    await route.fulfill({
      json: {
        mail: [{ value: 'test@example.com' }],
        field_first_name: [{ value: 'Test' }],
        field_last_name: [{ value: 'Recorder' }],
        field_training: [{ value: account.training }],
      },
    });
  });

  return account;
}

const trainingToggle = (page: Page) =>
  page
    .locator('#settings-menu .switch-input')
    .filter({ hasText: 'Training Mode' })
    .getByRole('switch');

const storedTraining = (page: Page) =>
  page.evaluate(async () => {
    const user = (await (window as any).mainStore.findAll()).find(
      (record: any) => record.cid === 'user'
    );
    return user.data.training;
  });

test('synchronises training mode with the website and applies it to new surveys', async ({
  recordingPage: page,
}) => {
  const account = await mockTrainingProfile(page, true);
  await page.goto('/settings/menu');
  await expect(trainingToggle(page)).toBeChecked();
  await expect.poll(() => storedTraining(page)).toBe(true);

  await trainingToggle(page).press('Space');
  await expect.poll(() => account.updates).toEqual([false]);
  await expect(trainingToggle(page)).not.toBeChecked();
  await expect(page.locator('ion-loading')).not.toBeVisible();
  await expect.poll(() => storedTraining(page)).toBe(false);

  await page.reload();
  await expect(trainingToggle(page)).not.toBeChecked();

  // A website change must replace the cached account preference on startup.
  account.training = true;
  await page.reload();
  await expect(trainingToggle(page)).toBeChecked();
  await expect.poll(() => storedTraining(page)).toBe(true);

  let surveyCount = 0;

  for (const survey of [
    '15min Count',
    '15min Single Species Count',
    'eBMS Transect',
    'Moth survey',
    'Bait-trap survey',
  ]) {
    await page.goto('/home/home');
    await expect(page.locator('#home-home')).toBeVisible();
    await openSurvey(page, survey);
    surveyCount++;
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await (window as any).samplesStore.findAll()).map(
            (sample: any) => sample.data.data.training
          )
        )
      )
      .toEqual(Array(surveyCount).fill(true));
  }
});

test('rolls back training mode when the account update fails', async ({
  recordingPage: page,
}) => {
  const account = await mockTrainingProfile(page, false);
  account.failUpdates = true;
  await page.goto('/settings/menu');
  await expect(trainingToggle(page)).not.toBeChecked();

  await trainingToggle(page).press('Space');
  await expect.poll(() => account.updates).toEqual([true]);
  await expect(page.locator('ion-loading')).not.toBeVisible();
  await expect(trainingToggle(page)).not.toBeChecked();
  await expect.poll(() => storedTraining(page)).toBe(false);
  expect(account.training).toBe(false);
});

test('requires an account to change training mode', async ({ homePage }) => {
  await homePage.goto('/settings/menu');
  await expect(trainingToggle(homePage)).toBeDisabled();
});
