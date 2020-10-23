import React from 'react';
import PropTypes from 'prop-types';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Page, Header, toast } from '@apps';
import Main from './Main';

const { success, warn, error } = toast;

async function resetApp(saveSamples, appModel, userModel) {
  Log('Settings:Menu:Controller: resetting the application!', 'w');
  try {
    await appModel.resetDefaults();
    await userModel.resetDefaults();
    await saveSamples.resetDefaults();

    success(t('Done'));
  } catch (e) {
    error(`${e.message}`);
  }
}

function onToggle(appModel, setting, checked) {
  Log('Settings:Menu:Controller: setting toggled.');
  appModel.attrs[setting] = checked; // eslint-disable-line no-param-reassign
  appModel.save();
}

async function uploadAllSamples(saveSamples, userModel, t) {
  Log('Settings:Menu:Controller: sending all samples.');

  if (!userModel.hasLogIn()) {
    warn(t('Please log in first to upload the records.'));
    return;
  }

  try {
    const affectedRecordsCount = await saveSamples.remoteSaveAll();
    success(t('Uploading {{count}} record', { count: affectedRecordsCount }));
  } catch (e) {
    error(`${e.message}`);
  }
}

const Container = observer(({ savedSamples, appModel, userModel, t }) => {
  const {
    useTraining,
    useExperiments,
    sendAnalytics,
    language,
    country,
    primarySurvey,
  } = appModel.attrs;

  return (
    <Page id="settings-menu">
      <Header title="Settings" />
      <Main
        useTraining={useTraining}
        useExperiments={useExperiments}
        sendAnalytics={sendAnalytics}
        primarySurvey={primarySurvey}
        uploadAllSamples={() => uploadAllSamples(savedSamples, userModel, t)}
        resetApp={() => resetApp(savedSamples, appModel, userModel)}
        onToggle={(setting, checked) => onToggle(appModel, setting, checked)}
        language={language}
        country={country}
      />
    </Page>
  );
});

Container.propTypes = {
  savedSamples: PropTypes.array.isRequired,
  appModel: PropTypes.object.isRequired,
  userModel: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(Container);
