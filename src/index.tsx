import { configure as mobxConfig } from 'mobx';
import { createRoot } from 'react-dom/client';
import { App as AppPlugin } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { sentryOptions } from '@flumens';
import { loadingController } from '@ionic/core';
import { setupIonicReact, isPlatform } from '@ionic/react';
import * as SentryBrowser from '@sentry/browser';
import config from 'common/config';
import migrationManager from 'common/migrations';
import groups from 'common/models/collections/groups';
import locations from 'common/models/collections/locations';
import speciesLists from 'common/models/collections/speciesLists';
import migrate from 'common/models/migrate';
import { db } from 'common/models/store';
import appModel from 'models/app';
import samples from 'models/collections/samples';
import userModel from 'models/user';
import App from './App';

console.log('🚩 App starting.');

setupIonicReact();

mobxConfig({ enforceActions: 'never' });

(async function () {
  if (isPlatform('hybrid') && !localStorage.getItem('sqliteMigrated')) {
    SentryBrowser.init({
      ...sentryOptions,
      release: config.version,
      dist: config.build,
      dsn: config.sentryDSN,
    });
    (await loadingController.create({ message: 'Upgrading...' })).present();
    await migrate();
    localStorage.setItem('sqliteMigrated', 'true');
    window.location.reload();
    return;
  }

  // Run first migration
  // TODO: remove in future when all users have updated
  if (!window.localStorage.getItem('_lastAppMigratedVersion'))
    window.localStorage.setItem('_lastAppMigratedVersion', '1.0.0');

  await migrationManager.run();

  await db.init();
  await userModel.fetch();
  await appModel.fetch();
  await samples.fetch();
  await locations.fetch();
  await groups.fetch();
  await speciesLists.fetch();

  appModel.data.sendAnalytics &&
    SentryBrowser.init({
      ...sentryOptions,
      dsn: config.sentryDSN,
      environment: config.environment,
      release: config.version,
      dist: config.build,
      enabled: config.environment === 'production',
      initialScope: {
        user: { id: userModel.id },
        tags: { session: appModel.data.appSession },
      },
    });

  appModel.data.appSession += 1;

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
