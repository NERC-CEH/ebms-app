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

  test('edits an occurrence count and updates the species total', async ({
    recordingPage,
  }) => {
    await openSurvey(recordingPage, '15min Count');
    await recordingPage.getByText('Add species', { exact: true }).click();
    await selectSpecies(recordingPage, 'Painted', 'Painted Lady');

    await recordingPage
      .locator('#list')
      .last()
      .getByText('Painted Lady')
      .click();
    const speciesOccurrencesUrl = recordingPage.url();
    const occurrenceEntry = recordingPage.getByRole('listitem').filter({
      hasText: 'Adult',
    });
    await expect(occurrenceEntry.getByText('1', { exact: true })).toHaveCount(
      0
    );
    await recordingPage.getByText('Adult', { exact: true }).last().click();

    const occurrencePage = recordingPage
      .locator('#precise-area-count-edit-occurrence')
      .last();
    const abundance = occurrencePage.getByRole('textbox', {
      name: 'Abundance',
    });
    await expect(abundance).toHaveValue('1');
    await abundance.fill('3');
    await abundance.blur();

    const surveyUrl = recordingPage.url().split('/samples/')[0];
    // Model autosave is debounced; reload only after the edit is durable.
    await expect
      .poll(() =>
        recordingPage.evaluate(async () => {
          const samples = await (window as any).samplesStore.findAll();
          return samples.some((sample: any) =>
            sample.data.samples.some((subSample: any) =>
              subSample.occurrences.some(
                (occurrence: any) => occurrence.data['occAttr:780'] === 3
              )
            )
          );
        })
      )
      .toBe(true);
    await recordingPage.reload();
    await expect(
      recordingPage
        .locator('#precise-area-count-edit-occurrence')
        .last()
        .getByRole('textbox', { name: 'Abundance' })
    ).toHaveValue('3');

    await recordingPage.goto(speciesOccurrencesUrl);
    await expect(occurrenceEntry.getByText('3', { exact: true })).toBeVisible();

    await recordingPage.goto(surveyUrl);
    await expect(
      recordingPage
        .locator('#precise-area-count-edit')
        .last()
        .getByRole('button', { name: '3' })
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

  test('offers continuation when the timer expires on the current page, respecting pauses', async ({
    recordingPage,
  }) => {
    await recordingPage.clock.install();
    await openSurvey(recordingPage, '15min Count');
    await walkSurveyArea(recordingPage);
    await expect(recordingPage.getByText(/\d+ m²/)).toBeVisible();
    const surveyUrl = recordingPage.url();
    const duration = recordingPage.getByText('Duration', { exact: true });
    const prompt = recordingPage.getByRole('alertdialog', {
      name: "Time's up!",
    });

    await duration.click();
    await recordingPage.clock.fastForward('16:00');
    await expect(prompt).not.toBeVisible();

    await duration.click();
    await recordingPage.clock.fastForward('16:00');
    await expect(prompt).toContainText('starting another 15-minute survey');
    await expect(recordingPage).toHaveURL(surveyUrl);
    await prompt.getByRole('button', { name: 'Cancel', exact: true }).click();

    await recordingPage
      .getByText('Additional Details', { exact: true })
      .click();
    await recordingPage.getByRole('button', { name: 'Back' }).last().click();
    await expect(recordingPage.getByText('No species added')).toBeVisible();
    await expect(prompt).not.toBeVisible();
  });

  test('does not offer continuation for an invalid expired count', async ({
    recordingPage,
  }) => {
    await openSurvey(recordingPage, '15min Count');
    await expect(recordingPage).toHaveURL(/\/survey\/precise-area\/[^/]+$/);
    const surveyUrl = recordingPage.url();
    await recordingPage
      .getByText('Additional Details', { exact: true })
      .click();
    await recordingPage.clock.setSystemTime(Date.now() + 16 * 60 * 1000);
    await recordingPage.getByRole('button', { name: 'Back' }).last().click();

    await expect(recordingPage.getByText('No species added')).toBeVisible();
    await expect(
      recordingPage.getByRole('alertdialog', { name: "Time's up!" })
    ).not.toBeVisible();
    await expect(recordingPage).toHaveURL(surveyUrl);

    await recordingPage.getByRole('button', { name: 'Finish' }).click();
    await expect(
      recordingPage.getByRole('alertdialog', { name: 'Survey incomplete' })
    ).toContainText('Location is missing');
  });

  test('continues an expired count with a new survey and resets Back navigation', async ({
    recordingPage,
  }) => {
    await openSurvey(recordingPage, '15min Count');
    await walkSurveyArea(recordingPage);
    await recordingPage.getByText('Add species', { exact: true }).click();
    await selectSpecies(recordingPage, 'Painted', 'Painted Lady');
    const previousSurveyUrl = recordingPage.url();

    await recordingPage
      .getByText('Additional Details', { exact: true })
      .click();
    await recordingPage.clock.setSystemTime(Date.now() + 16 * 60 * 1000);
    const prompt = recordingPage.getByRole('alertdialog', {
      name: "Time's up!",
    });
    await expect(prompt).not.toBeVisible();
    await recordingPage.getByRole('button', { name: 'Back' }).last().click();

    await expect(prompt).toContainText('starting another 15-minute survey');
    await prompt.getByRole('button', { name: /^Start new$/i }).click();
    await expect(recordingPage).not.toHaveURL(previousSurveyUrl);
    await expect(recordingPage.getByText('No species added')).toBeVisible();
    await expect(recordingPage.locator('#countdown').last()).toHaveText(
      /^\d{2}:\d{2}$/
    );
    await expect
      .poll(() =>
        recordingPage.evaluate(async () => {
          const samples = await (window as any).samplesStore.findAll();
          return samples.filter((sample: any) => sample.data.metadata.saved)
            .length;
        })
      )
      .toBe(1);

    await recordingPage.getByRole('button', { name: 'Back' }).last().click();
    await recordingPage
      .getByRole('alertdialog', { name: 'Exit Survey' })
      .getByRole('button', { name: 'Exit' })
      .click();
    await expect(recordingPage.locator('#home-home')).toBeVisible();
  });

  test('does not offer continuation for a count that expired before restart', async ({
    recordingPage,
  }) => {
    await openSurvey(recordingPage, '15min Count');
    await walkSurveyArea(recordingPage);
    const surveyUrl = recordingPage.url();
    await recordingPage
      .getByText('Additional Details', { exact: true })
      .click();
    await recordingPage.clock.setSystemTime(Date.now() + 16 * 60 * 1000);

    // Let the count expire off its home page, without answering a prompt.
    await expect
      .poll(() =>
        recordingPage.evaluate(async () => {
          const [sample] = await (window as any).samplesStore.findAll();
          return !!sample.data.data.surveyEndTime;
        })
      )
      .toBe(true);

    await recordingPage.goto(surveyUrl);
    await expect(recordingPage.getByText('No species added')).toBeVisible();
    await expect(
      recordingPage.getByRole('alertdialog', { name: "Time's up!" })
    ).not.toBeVisible();
    await recordingPage
      .getByText('Additional Details', { exact: true })
      .click();
    await recordingPage.getByRole('button', { name: 'Back' }).last().click();
    await expect(
      recordingPage.getByRole('alertdialog', { name: "Time's up!" })
    ).not.toBeVisible();
  });

  test('remembers not to offer continuation for future counts', async ({
    recordingPage,
  }) => {
    await openSurvey(recordingPage, '15min Count');
    await walkSurveyArea(recordingPage);
    const surveyUrl = recordingPage.url();
    await recordingPage
      .getByText('Additional Details', { exact: true })
      .click();
    await recordingPage.clock.setSystemTime(Date.now() + 16 * 60 * 1000);
    await recordingPage.getByRole('button', { name: 'Back' }).last().click();

    const prompt = recordingPage.getByRole('alertdialog', {
      name: "Time's up!",
    });
    await prompt.getByText("Don't show this again", { exact: true }).click();
    await expect(
      prompt.getByRole('switch', { name: "Don't show this again" })
    ).toBeChecked();
    await prompt.getByRole('button', { name: 'No', exact: true }).click();
    await expect(recordingPage).toHaveURL(surveyUrl);
    await expect
      .poll(() =>
        recordingPage.evaluate(async () => {
          const app = (await (window as any).mainStore.findAll()).find(
            (record: any) => record.cid === 'app'
          );
          return app.data.showContinueSurveyPrompt;
        })
      )
      .toBe(false);

    await recordingPage.goto('/home/home');
    await openSurvey(recordingPage, '15min Count');
    await recordingPage
      .getByRole('alertdialog', { name: 'Draft' })
      .getByRole('button', { name: 'Start new' })
      .click();
    await expect(recordingPage).not.toHaveURL(surveyUrl);
    await recordingPage
      .getByText('Additional Details', { exact: true })
      .click();
    await recordingPage.clock.setSystemTime(Date.now() + 32 * 60 * 1000);
    await recordingPage.getByRole('button', { name: 'Back' }).last().click();
    await expect(recordingPage.locator('#countdown').last()).toHaveText(
      "Time's up!"
    );
    await expect(prompt).not.toBeVisible();
  });

  test('persists the auto-start area counts preference from Settings', async ({
    homePage,
  }) => {
    await homePage.goto('/settings/menu');
    const autoStart = homePage.getByRole('switch', {
      name: 'Auto-start area counts',
    });
    const getPreference = () =>
      homePage.evaluate(async () => {
        const app = (await (window as any).mainStore.findAll()).find(
          (record: any) => record.cid === 'app'
        );
        return app.data.showContinueSurveyPrompt;
      });

    await expect(autoStart).toBeChecked();
    await expect(
      homePage.getByText(
        'Ask to start another 15-minute count when the current count ends.'
      )
    ).toBeVisible();
    await autoStart.press('Space');
    await expect.poll(getPreference).toBe(false);
    await homePage.reload();
    await expect(autoStart).not.toBeChecked();

    await autoStart.press('Space');
    await expect.poll(getPreference).toBe(true);
    await homePage.reload();
    await expect(autoStart).toBeChecked();
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
