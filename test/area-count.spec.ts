import { test, expect } from './fixtures';
import { openSurvey, selectSpecies, walkSurveyArea } from './utils';

test.describe('15min Count', () => {
  test('requires an account before starting a survey', async ({ homePage }) => {
    await openSurvey(homePage, '15min Count');

    await expect(homePage.locator('#user-login')).toBeVisible();
    await expect(homePage.getByPlaceholder('Email')).toBeVisible();
    await expect(homePage.getByPlaceholder('Password')).toBeVisible();
  });

  test('validates, finishes and persists a local survey', async ({
    recordingPage,
  }) => {
    await openSurvey(recordingPage, '15min Count');
    await expect(
      recordingPage.getByRole('button', { name: 'Finish' })
    ).toBeVisible();
    await expect(recordingPage.getByText('No species added')).toBeVisible();

    await recordingPage.getByRole('button', { name: 'Finish' }).click();
    const incomplete = recordingPage.getByRole('alertdialog', {
      name: 'Survey incomplete',
    });
    await expect(incomplete).toBeVisible();
    await expect(incomplete).toContainText('Location is missing');
    await recordingPage.getByRole('button', { name: 'Got it' }).click();

    await walkSurveyArea(recordingPage);
    await expect(recordingPage.getByText(/\d+ m²/)).toBeVisible();

    await recordingPage.getByText('Add species', { exact: true }).click();
    await selectSpecies(recordingPage, 'Painted', 'Painted Lady');
    await expect(
      recordingPage.locator('#list').last().getByText('Painted Lady')
    ).toBeVisible();

    await recordingPage.getByRole('button', { name: 'Finish' }).click();
    const pending = recordingPage.locator('#home-user-surveys');
    await expect(pending.getByText('15min Count')).toBeVisible();
    await expect(pending.getByText(/\d+m²/)).toBeVisible();

    await recordingPage.reload();
    await expect(
      recordingPage.locator('#home-user-surveys').getByText('15min Count')
    ).toBeVisible();
  });

  test('offers to continue a persisted draft', async ({ recordingPage }) => {
    await openSurvey(recordingPage, '15min Count');
    const surveyUrl = recordingPage.url();

    // App model persistence is debounced by three seconds.
    await recordingPage.waitForTimeout(3500);
    await recordingPage.goto('/home/home');
    await openSurvey(recordingPage, '15min Count');

    const draft = recordingPage.getByRole('alertdialog', { name: 'Draft' });
    await expect(draft).toBeVisible();
    await draft.getByRole('button', { name: 'Continue' }).click();
    await expect(recordingPage).toHaveURL(surveyUrl);
    await expect(
      recordingPage.getByRole('button', { name: 'Finish' })
    ).toBeVisible();
  });
});
