import { test, expect } from './fixtures';
import { openSurvey, selectSpecies } from './utils';

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
