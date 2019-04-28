// /** ****************************************************************************
//  * App start.
//  **************************************************************************** */

import 'helpers/system_checkup';
import 'helpers/analytics';

import React from 'react'; // eslint-disable-line
import 'helpers/translator';

import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import { IonApp, IonSplitPane, IonPage } from '@ionic/react';
import Info from './Info';
import Home from './Home';
import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';
import './common/styles/app.scss';

const App = () => (
  <Router>
    <div id="app">
      <IonApp>
        <IonSplitPane contentId="main">
          <IonPage id="main">
            <Switch>
              <Route path="/info" component={Info} />
              <Route path="/" component={Home} />
            </Switch>
          </IonPage>
        </IonSplitPane>
      </IonApp>
    </div>
  </Router>
);

export default App;

// App.on('start', () => {
//   const modelsInit = Promise.all([appModel._init, userModel._init]);
//   modelsInit.then(() => {
//     // update app first
//     Update.run(() => {
//       // release the beast
//       Log('App: starting.');

//       if (Backbone.history) {
//         Backbone.history.stop(); // https://stackoverflow.com/questions/7362989/backbone-history-has-already-been-started
//         Backbone.history.start();
//         if (App.getCurrentRoute() === '') {
//           if (appModel.get('showWelcome')) {
//             radio.trigger('info:welcome');
//           } else {
//             radio.trigger('samples:list');
//           }
//         }

//         if (window.cordova) {
//           Log('App: cordova setup.');

//           // Although StatusB  ar in the global scope,
//           // it is not available until after the deviceready event.
//           document.addEventListener(
//             'deviceready',
//             () => {
//               Log('Showing the app.');

//               if (Device.isIOS()) {
//                 // iOS make space for statusbar
//                 $('body').addClass('ios');
//               }

//               // hide loader
//               if (navigator && navigator.splashscreen) {
//                 navigator.splashscreen.hide();
//               }

//               Analytics.trackEvent('App', 'initialized');
//             },
//             false
//           );
//         }

//       }
//     });
//   });
// });
