import React from 'react';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import AppHeader from 'common/Components/Header';
import Main from './Main';

function resetApp() {
  Log('Settings:Menu:Controller: resetting the application!', 'w');
  appModel.resetDefaults();
  userModel.logOut();
  return savedSamples.resetDefaults();
}

function onToggle(setting, checked) {
  Log('Settings:Menu:Controller: setting toggled.');
  if (setting === 'useExperiments' && !checked) {
    appModel.set('useExperiments', false);
    appModel.save();
    return;
  }

  appModel.set(setting, checked);
  appModel.save();
}

const Container = observer(() => {
  const useTraining = appModel.get('useTraining');
  const useExperiments = appModel.get('useExperiments');

  return (
    <>
      <AppHeader title={t('Settings')} />
      <Main
        useTraining={useTraining}
        useExperiments={useExperiments}
        resetApp={resetApp}
        onToggle={onToggle}
      />
    </>
  );
});

Container.propTypes = {};

export default Container;
