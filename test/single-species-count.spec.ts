import { test, expect } from './fixtures';
import { openSurvey, selectSpecies, walkSurveyArea } from './utils';

test('completes a Painted Lady single-species count', async ({
  recordingPage,
}) => {
  await openSurvey(recordingPage, '15min Single Species Count');
  await expect(
    recordingPage.getByRole('searchbox', { name: 'search text' })
  ).toBeVisible();

  await selectSpecies(recordingPage, 'Painted', 'Painted Lady');
  await expect(
    recordingPage.getByRole('button', { name: 'Start Count' })
  ).toBeVisible();
  await walkSurveyArea(recordingPage);
  await recordingPage.getByRole('button', { name: 'Start Count' }).click();

  await expect(
    recordingPage.getByText(/don't have any Painted Lady records/)
  ).toBeVisible();
  await recordingPage.getByRole('button', { name: 'Add' }).click();
  await expect(recordingPage.getByText('Adult', { exact: true })).toBeVisible();

  await recordingPage.locator('#list').last().getByRole('listitem').click();
  const occurrence = recordingPage.locator(
    '#precise-area-count-edit-occurrence'
  );
  await expect(occurrence.getByText('Wing condition')).toBeVisible();
  await expect(
    occurrence.getByText('Behaviour', { exact: true })
  ).toBeVisible();

  await occurrence.locator('.photo-picker button').click();
  await expect(
    recordingPage.getByText('Choose a method to upload a photo')
  ).toBeVisible();
  await expect(
    recordingPage.getByRole('button', { name: 'Gallery' })
  ).toBeVisible();
  await expect(
    recordingPage.getByRole('button', { name: 'Camera' })
  ).toBeVisible();
  await recordingPage.getByRole('button', { name: 'Cancel' }).click();
  await occurrence.getByRole('textbox', { name: 'Comment' }).fill('Migrating');
  await occurrence.getByText('Wing condition').click();
  await recordingPage.getByText('Fresh', { exact: true }).click();
  await recordingPage.getByRole('button', { name: 'Back' }).last().click();
  await occurrence.getByText('Behaviour', { exact: true }).click();
  await recordingPage.getByRole('radio', { name: 'Migrating' }).press('Space');
  await recordingPage.getByRole('button', { name: 'Back' }).last().click();
  await expect(occurrence.getByText('Direction')).toBeVisible();
  await expect(occurrence.getByText('Height')).toBeVisible();

  await occurrence.getByRole('button', { name: 'Back' }).click();
  await recordingPage.getByRole('button', { name: 'Finish' }).click();
  await expect(
    recordingPage
      .locator('#home-user-surveys')
      .getByText('15min Single Species Count')
  ).toBeVisible();
});
