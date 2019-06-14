import React from 'react';
import Log from 'helpers/log';
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

const Container = ({ ...props }) => {
  return (
    <>
      <AppHeader title={t('Settings')} />
      <Main resetApp={resetApp} {...props} appModel={appModel} />
    </>
  );
};

Container.propTypes = {};

export default Container;
