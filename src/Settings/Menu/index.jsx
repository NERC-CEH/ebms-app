import React from 'react';
import PropTypes from 'prop-types';
import Log from 'helpers/log';
import { Page, Header, toast } from '@apps';
import Main from './Main';

const { success, warn, error } = toast;

async function resetApp(saveSamples, appModel, userModel) {
  Log('Settings:Menu:Controller: resetting the application!', 'w');
  try {
    await appModel.resetDefaults();
    await userModel.resetDefaults();
    await saveSamples.resetDefaults();

    success('Done');
  } catch (e) {
    error(`${e.message}`);
  }
}

async function uploadAllSamples(saveSamples, userModel) {
  Log('Settings:Menu:Controller: sending all samples.');

  if (!userModel.hasLogIn()) {
    warn('Please log in first to upload the records.');
    return;
  }

  try {
    const affectedRecordsCount = await saveSamples.remoteSaveAll();
    success('Uploading {{count}} record', { count: affectedRecordsCount });
  } catch (e) {
    error(`${e.message}`);
  }
}

const onToggleWrap = (appModel, setting, checked) => {
  Log('Settings:Menu:Controller: setting toggled.');
  appModel.attrs[setting] = checked; // eslint-disable-line no-param-reassign
  appModel.save();
};

const Container = ({ savedSamples, appModel, userModel }) => {
  const {
    useTraining,
    useExperiments,
    sendAnalytics,
    language,
    country,
    primarySurvey,
    speciesGroups,
  } = appModel.attrs;

  const resetAppWrap = () => resetApp(savedSamples, appModel, userModel);
  const uploadAllSamplesWrap = () => uploadAllSamples(savedSamples, userModel);

  const onToggle = (...args) => onToggleWrap(appModel, ...args);

  return (
    <Page id="settings-menu">
      <Header title="Settings" />
      <Main
        useTraining={useTraining}
        useExperiments={useExperiments}
        sendAnalytics={sendAnalytics}
        primarySurvey={primarySurvey}
        uploadAllSamples={uploadAllSamplesWrap}
        resetApp={resetAppWrap}
        onToggle={onToggle}
        language={language}
        speciesGroups={speciesGroups}
        country={country}
      />
    </Page>
  );
};

Container.propTypes = {
  savedSamples: PropTypes.array.isRequired,
  appModel: PropTypes.object.isRequired,
  userModel: PropTypes.object.isRequired,
};

export default Container;
