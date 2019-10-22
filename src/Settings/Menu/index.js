import React from 'react';
import PropTypes from 'prop-types';
import { IonPage } from '@ionic/react';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import savedSamples from 'saved_samples';
import AppHeader from 'Components/Header';
import Main from './Main';

function resetApp(appModel, userModel) {
  Log('Settings:Menu:Controller: resetting the application!', 'w');
  appModel.resetDefaults();
  userModel.logOut();
  return savedSamples.resetDefaults();
}

function onToggle(appModel, setting, checked) {
  Log('Settings:Menu:Controller: setting toggled.');
  if (setting === 'useExperiments' && !checked) {
    appModel.set('useExperiments', false);
    appModel.save();
    return;
  }

  appModel.set(setting, checked);
  appModel.save();
}

const Container = observer(({ appModel, userModel }) => {
  const useTraining = appModel.get('useTraining');
  const sendAnalytics = appModel.get('sendAnalytics');
  const language = appModel.get('language');
  const country = appModel.get('country');

  return (
    <IonPage>
      <AppHeader title={t('Settings')} />
      <Main
        useTraining={useTraining}
        sendAnalytics={sendAnalytics}
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
