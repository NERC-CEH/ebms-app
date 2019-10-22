import { AppModel } from 'app_model';

/* eslint-disable no-unused-expressions */
function initAppModel() {
  const appModel = new AppModel();
  return appModel._init.then(() => appModel);
}

describe('App Model', () => {
  before(() =>
    initAppModel().then(appModel => {
      appModel.resetDefaults();
    })
  );

  it('has default values', () => {
    const appModel = new AppModel();
    expect(appModel.attrs).to.have.all.keys([
      'showedWelcome',
      'language',
      'country',
      'useTraining',
      'feedbackGiven',
      'areaSurveyListSortedByTime',
      'areaCountDraftId',
      'useExperiments',
      'sendAnalytics',
    ]);
  });
});
