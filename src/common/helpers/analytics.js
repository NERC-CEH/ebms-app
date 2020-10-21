import * as Sentry from '@sentry/browser';
import CONFIG from 'config';
import userModel from 'userModel';
import appModel from 'appModel';
import savedSamples from 'savedSamples';
import Log from './log';

function _removeUUID(string) {
  // remove specific UUIDs
  return string.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    'UUID'
  );
}

export function removeUserId(URL) {
  return URL.replace(/\/users\/.*/g, '/users/USERID');
}

/* eslint-disable no-param-reassign */
export function beforeBreadcrumb(crumb) {
  // clean UUIDs
  if (crumb.category === 'navigation') {
    crumb.data = {
      to: _removeUUID(crumb.data.to),
      from: _removeUUID(crumb.data.from),
    };
    return crumb;
  }

  if (['xhr', 'fetch'].includes(crumb.category)) {
    if (crumb.data.method === 'GET' && crumb.data.url.match(/jpeg$/i)) {
      crumb.data.url = crumb.data.url.replace(
        /files\/\d+\.jpeg/i,
        'files/FILENAME.jpeg'
      );
    }

    // crumb.data = {
    //   url: removeUserId(crumb.data.url),
    // };
    return crumb;
  }

  return crumb;
}
/* eslint-enable no-param-reassign */

function setContext() {
  Sentry.setUser({ id: userModel.attrs.id });
  Sentry.setTag('app.records', savedSamples.length);
  Sentry.setTag('app.language', appModel.attrs.language);
  Sentry.setTag('app.useTraining', appModel.attrs.useTraining || false);
  Sentry.setTag('app.feedbackGiven', appModel.attrs.feedbackGiven || false);
  Sentry.setTag('app.appSession', appModel.attrs.appSession);
  Sentry.setTag('app.build', CONFIG.build);
}

export default function init() {
  const isLoggedIn = !!userModel.attrs.id;
  if (!isLoggedIn || !appModel.attrs.sendAnalytics) {
    return;
  }

  Log('Analytics: initializing.');
  if (!CONFIG.sentry) {
    Log(
      'Analytics: server error logging is turned off. Please provide Sentry key.',
      'w'
    );
    return;
  }

  Log('Analytics: turning on server error logging.');
  Sentry.init({
    dsn: CONFIG.sentry,
    environment: CONFIG.environment,
    release: `${CONFIG.name}@${CONFIG.version}`,
    maxBreadcrumbs: 400,
    ignoreErrors: [
      'Incorrect password or email', // no need to log that
    ],
    beforeBreadcrumb,
  });

  setContext();

  // capture unhandled promises
  window.onunhandledrejection = e => {
    Sentry.withScope(scope => {
      scope.setExtra('unhandledPromise', true);
      Sentry.captureException(e.reason);
    });
  };
}
