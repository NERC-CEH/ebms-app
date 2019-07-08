// polyfills for Android 5.0
import 'core-js/features/map';
import 'core-js/features/set';

import React from 'react';
import ReactDOM from 'react-dom';

import appModel from 'app_model';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import Device from 'helpers/device';
import App from './App';


function uploadSavedRecords() {
  if (!Device.isOnline() && !appModel.get('allowEdit')) {
    savedSamples.uploadAllSaved();
  }
}

async function init() {
  await appModel._init;
  await userModel._init;
  await savedSamples._init;

  // TODO: Update.run()

  uploadSavedRecords()
  
  if (window.cordova) {
    document.addEventListener(
      'deviceready',
      () => {
        if (navigator && navigator.splashscreen) {
          navigator.splashscreen.hide();
        }
      },
      false
    );
  }

  ReactDOM.render(<App />, document.getElementById('root'));
}

init();
