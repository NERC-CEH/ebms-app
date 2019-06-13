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
  Redirect,
} from 'react-router-dom';
import { IonApp, IonSplitPane, IonPage } from '@ionic/react';
import Home from './Home';
import Info from './Info';
import SplashScreenRequired from './Info/SplashScreenRequired';
import User from './User';
import Settings from './Settings/Menu';
import Survey from './Survey';
import LanguageCountrySelectRequired from './Settings/LanguageCountrySelectRequired';
import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';
import './common/styles/app.scss';

const App = () => (
  <Router>
    <div id="app">
      <IonApp>
        <LanguageCountrySelectRequired>
          <SplashScreenRequired>
            <IonSplitPane contentId="main">
              <IonPage id="main">
                <Switch>
                  <Route path="/info" component={Info} />
                  <Route path="/user" component={User} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/survey" component={Survey} />
                  <Route
                    exact
                    path="/"
                    render={() => <Redirect to="/home/report" />}
                  />

                  <Route path="/" component={Home} />
                </Switch>
              </IonPage>
            </IonSplitPane>
          </SplashScreenRequired>
        </LanguageCountrySelectRequired>
      </IonApp>
    </div>
  </Router>
);

export default App;