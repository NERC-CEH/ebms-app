// polyfills for Android 5.0
import 'core-js/features/map';
import 'core-js/features/set';

import React from 'react';
import ReactDOM from 'react-dom';

import appModel from 'app_model';
import userModel from 'user_model';
import App from './App';

async function init() {
  await appModel._init;
  await userModel._init;

  ReactDOM.render(<App />, document.getElementById('root'));
}

init();
