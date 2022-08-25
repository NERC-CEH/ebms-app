import ReactDOM from 'react-dom';
import { setupIonicReact, isPlatform } from '@ionic/react';
import appModel from 'models/app';
import userModel from 'models/user';
import savedSamples from 'models/collections/samples';
import locations from 'common/models/collections/locations';
import config from 'common/config';
import { configure as mobxConfig } from 'mobx';
import { initAnalytics, device } from '@flumens';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as AppPlugin } from '@capacitor/app';
import App from './App';

console.log('🚩 App starting.');

setupIonicReact({ swipeBackEnabled: false });

mobxConfig({ enforceActions: 'never' });

(async function () {
  await appModel.ready;
  await userModel.ready;
  await savedSamples._init;
  await locations.ready;

  appModel.attrs.sendAnalytics &&
    initAnalytics({
      dsn: config.sentryDNS,
      environment: config.environment,
      build: config.build,
      release: config.version,
      userId: userModel.id,
      tags: {
        'app.appSession': appModel.attrs.appSession,
      },
    });

  appModel.attrs.appSession += 1;

  if (appModel.attrs.primarySurvey === 'area') {
    // MIGRATION v1.11.0
    // remove after this propagates to all users
    appModel.attrs.primarySurvey = 'precise-area';
  }

  appModel.save();

  if (userModel.attrs.password && device.isOnline) {
    // MIGRATION v1.11.1
    // remove after this propagates to all users
    try {
      userModel._migrateAuth();
    } catch (_) {
      // do nothing
    }
  }

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
