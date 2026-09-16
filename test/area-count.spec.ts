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

  test('pauses and resumes the countdown', async ({ recordingPage }) => {
    await openSurvey(recordingPage, '15min Count');

    const duration = recordingPage
      .locator('#precise-area-count-edit')
      .last()
      .getByText('Duration', { exact: true });
    const countdown = recordingPage.locator('#countdown').last();

    await expect(countdown).toHaveText(/\d{2}:\d{2}/);
    await duration.click();
    await expect(countdown).toHaveText('Paused');
    await duration.click();
    await expect(countdown).toHaveText(/\d{2}:\d{2}/);
  });

  test('records and keeps a draft while offline', async ({ recordingPage }) => {
    await recordingPage.context().setOffline(true);
    await openSurvey(recordingPage, '15min Count');

    await recordingPage.getByText('Add species', { exact: true }).click();
    await selectSpecies(recordingPage, 'Painted', 'Painted Lady');
    await expect(
      recordingPage.locator('#list').last().getByText('Painted Lady')
    ).toBeVisible();

    await recordingPage.getByRole('button', { name: 'Back' }).last().click();
    await recordingPage
      .getByRole('alertdialog', { name: 'Exit Survey' })
      .getByRole('button', { name: 'Exit' })
      .click();
    await recordingPage.getByRole('tab', { name: /Surveys/ }).click();

    const pending = recordingPage.locator('#home-user-surveys');
    await expect(pending.getByText('15min Count')).toBeVisible();
    await expect(pending.getByText('Running')).toBeVisible();
  });

  test('deletes a local draft permanently', async ({ recordingPage }) => {
    await openSurvey(recordingPage, '15min Count');
    await recordingPage.getByRole('button', { name: 'Back' }).last().click();
    await recordingPage
      .getByRole('alertdialog', { name: 'Exit Survey' })
      .getByRole('button', { name: 'Exit' })
      .click();
    await recordingPage.getByRole('tab', { name: /Surveys/ }).click();

    const survey = recordingPage
      .locator('.survey-list-item')
      .filter({ hasText: '15min Count' });
    await survey.evaluate(element =>
      (element as HTMLIonItemSlidingElement).open('end')
    );
    await survey.getByRole('button', { name: 'Delete' }).click();
    await recordingPage
      .getByRole('alertdialog', { name: 'Delete' })
      .getByRole('button', { name: 'Delete' })
      .click();

    await expect(survey).not.toBeVisible();
    await recordingPage.reload();
    await expect(
      recordingPage.getByText('No finished pending surveys.')
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
