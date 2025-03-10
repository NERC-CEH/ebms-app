import { configure as mobxConfig } from 'mobx';
import { createRoot } from 'react-dom/client';
import { App as AppPlugin } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { sentryOptions, device } from '@flumens';
import { setupIonicReact, isPlatform } from '@ionic/react';
import * as SentryBrowser from '@sentry/browser';
import config from 'common/config';
import groups from 'common/models/collections/groups';
import locations from 'common/models/collections/locations';
import appModel from 'models/app';
import samplesCollection from 'models/collections/samples';
import userModel from 'models/user';
import App from './App';

console.log('🚩 App starting.');

setupIonicReact();

mobxConfig({ enforceActions: 'never' });

(async function () {
  await appModel.ready;
  await userModel.ready;
  await samplesCollection.ready;
  await locations.ready;
  await groups.ready;

  appModel.attrs.sendAnalytics &&
    SentryBrowser.init({
      ...sentryOptions,
      dsn: config.sentryDNS,
      environment: config.environment,
      release: config.version,
      dist: config.build,
      initialScope: {
        user: { id: userModel.id },
        tags: { session: appModel.attrs.appSession },
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

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(<App />);

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
