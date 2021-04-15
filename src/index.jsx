import React from 'react';
import ReactDOM from 'react-dom';
import { setupConfig, isPlatform } from '@ionic/react';
import appModel from 'appModel';
import userModel from 'userModel';
import savedSamples from 'savedSamples';
import config from 'config';
import { configure as mobxConfig } from 'mobx';
import { initAnalytics } from '@apps';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import App from './App';

const { App: AppPlugin, StatusBar, SplashScreen } = Plugins;

console.log('🚩 App starting.');

setupConfig({
  hardwareBackButton: false, // android back button
  swipeBackEnabled: false,
});

mobxConfig({ enforceActions: 'never' });

(async function () {
  await appModel._init;
  await userModel._init;
  await savedSamples._init;

  appModel.attrs.sendAnalytics &&
    initAnalytics({
      dsn: config.sentryDNS,
      environment: config.environment,
      build: config.build,
      release: config.version,
      userId: userModel.attrs.drupalID,
      tags: {
        'app.appSession': appModel.attrs.appSession,
      },
    });

  appModel.attrs.appSession += 1;
  appModel.save();

  ReactDOM.render(<App />, document.getElementById('root'));

  if (isPlatform('hybrid')) {
    StatusBar.setStyle({
      style: StatusBarStyle.Dark,
    });

    SplashScreen.hide();

    AppPlugin.addListener('backButton', () => {
      /* disable android app exit using back button */
    });
  }
})();
