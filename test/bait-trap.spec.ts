import { test, expect } from './fixtures';
import { openSurvey, selectSpecies } from './utils';

test('completes a bait-trap survey with a trap visit and specimen', async ({
  recordingPage,
}) => {
  await openSurvey(recordingPage, 'Bait-trap survey');

  const details = recordingPage.locator('#survey-bait-trap-detail');
  await expect(details.getByText('Trapping Site')).toBeVisible();
  await expect(details.getByText('Dates', { exact: true })).toBeVisible();
  await details.getByText('Site', { exact: true }).click();
  await recordingPage
    .getByText('Test Bait Site', { exact: true })
    .evaluate(element => (element as HTMLElement).click());

  await expect(details.getByText('Test Bait Site')).toBeVisible();
  await expect(
    details.getByRole('textbox', { name: 'Total no. of traps' })
  ).toHaveValue('2');
  await expect(
    details.getByRole('textbox', { name: 'Trap locations' })
  ).toHaveValue('1');
  await expect(
    details.getByRole('textbox', { name: 'Event type' })
  ).toHaveValue('Bimonthly monitoring');
  await details.getByRole('button', { name: 'Next' }).click();

  await recordingPage.getByText('Add trap visit', { exact: true }).click();
  await recordingPage.getByText('Canopy Trap', { exact: true }).click();
  const trapDetails = recordingPage.locator('#survey-bait-trap-trap-detail');
  await expect(trapDetails.getByText('Canopy Trap')).toBeVisible();
  await expect(
    trapDetails.getByRole('button', { name: 'Stratum' })
  ).toBeVisible();
  await expect(
    trapDetails.getByRole('heading', { name: 'Weather' })
  ).toBeVisible();
  await trapDetails.getByRole('button', { name: 'Next' }).click();

  await recordingPage.getByText('Add species', { exact: true }).click();
  await selectSpecies(recordingPage, 'Peacock', 'Peacock');
  const specimen = recordingPage.locator('#survey-bait-trap-edit-occurrence');
  await expect(specimen.getByRole('textbox', { name: 'Code' })).toHaveValue(
    'A1'
  );
  await expect(
    specimen.getByRole('button', { name: 'Released Fate' })
  ).toBeVisible();
  await expect(
    specimen.getByRole('textbox', { name: 'Wing length' })
  ).toBeVisible();
  await specimen.getByRole('button', { name: 'Next' }).click();

  await expect(
    recordingPage.locator('#survey-bait-trap-trap-home').getByText('Peacock')
  ).toBeVisible();
  await recordingPage
    .locator('#survey-bait-trap-trap-home')
    .getByRole('button', { name: 'Back' })
    .click();
  await expect(recordingPage.getByText('1 species')).toBeVisible();
  await recordingPage
    .locator('#survey-bait-trap-home')
    .getByRole('button', { name: 'Finish' })
    .click();
  await expect(
    recordingPage.locator('#home-user-surveys').getByText('Bait-Trap Survey')
  ).toBeVisible();
});
