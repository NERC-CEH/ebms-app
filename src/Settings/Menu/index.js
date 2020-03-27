import React from 'react';
import PropTypes from 'prop-types';
import { IonPage } from '@ionic/react';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { resetDefaults, remoteSaveAll } from 'saved_samples';
import AppHeader from 'Components/Header';
import { success, warn, error } from 'helpers/toast';
import Main from './Main';

async function resetApp(appModel, userModel) {
  Log('Settings:Menu:Controller: resetting the application!', 'w');

  try {
    appModel.resetDefaults();
    userModel.logOut();
    await resetDefaults();

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

async function uploadAllSamples(userModel, t) {
  Log('Settings:Menu:Controller: sending all samples.');

  if (!userModel.hasLogIn()) {
    warn(t('Please log in first to upload the records.'));
    return;
  }

  try {
    const affectedRecordsCount = await remoteSaveAll();
    success(t('Uploading {{count}} record', { count: affectedRecordsCount }));
  } catch (e) {
    error(`${e.message}`);
  }
}

const Container = observer(({ appModel, userModel }) => {
  const { useTraining, sendAnalytics, language, country } = appModel.attrs;
  const { t } = useTranslation();

  return (
    <IonPage>
      <AppHeader title={t('Settings')} />
      <Main
        useTraining={useTraining}
        sendAnalytics={sendAnalytics}
        uploadAllSamples={() => uploadAllSamples(userModel, t)}
        resetApp={() => resetApp(appModel, userModel)}
        onToggle={(setting, checked) => onToggle(appModel, setting, checked)}
        language={language}
        country={country}
      />
    </IonPage>
  );
});

Container.propTypes = {
  appModel: PropTypes.object.isRequired,
  userModel: PropTypes.object.isRequired,
};

export default Container;
