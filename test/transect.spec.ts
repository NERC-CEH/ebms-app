import { test, expect } from './fixtures';
import { openSurvey, selectSpecies } from './utils';

test('completes a transect across its configured sections', async ({
  recordingPage,
}) => {
  await openSurvey(recordingPage, 'eBMS Transect');

  await recordingPage
    .getByRole('link', { name: 'Sections No transect' })
    .click();
  await recordingPage.getByText('Test Transect', { exact: true }).click();
  await expect(
    recordingPage.getByText('Section 1', { exact: true })
  ).toBeVisible();
  await expect(
    recordingPage.getByText('Section 2', { exact: true })
  ).toBeVisible();

  await recordingPage.getByText('Section 1', { exact: true }).click();
  await expect(recordingPage.getByText('Suitable conditions')).toBeVisible();
  await recordingPage.getByText('Add species', { exact: true }).click();
  await selectSpecies(recordingPage, 'Peacock', 'Peacock');
  await expect(
    recordingPage.locator('#list').last().getByText('Peacock')
  ).toBeVisible();

  await recordingPage
    .locator('#transect-sections-edit')
    .getByRole('button', { name: 'Next' })
    .click();
  const secondSection = recordingPage.locator('#transect-sections-edit').last();
  await expect(
    secondSection.getByText('Section 2', { exact: true })
  ).toBeVisible();
  await secondSection.getByText('Add species', { exact: true }).click();
  await selectSpecies(recordingPage, 'Painted', 'Painted Lady');
  await recordingPage
    .locator('#transect-sections-edit')
    .getByRole('button', { name: 'Finish' })
    .click();

  await recordingPage
    .locator('#transect-sections-list')
    .getByRole('button', { name: 'Back' })
    .click();
  await expect(
    recordingPage.getByRole('link', { name: 'Temperature 20' })
  ).toBeVisible();
  await expect(
    recordingPage.getByRole('link', { name: 'Wind Speed Slight smoke drift' })
  ).toBeVisible();

  await recordingPage
    .locator('#transect-edit')
    .first()
    .getByRole('button', { name: 'Finish' })
    .click();
  await expect(
    recordingPage.locator('#home-user-surveys').getByText('eBMS Transect')
  ).toBeVisible();
});
