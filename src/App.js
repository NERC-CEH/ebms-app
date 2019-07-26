// /** ****************************************************************************
//  * App start.
//  **************************************************************************** */

import 'helpers/system_checkup';
import 'helpers/analytics';

import React from 'react'; // eslint-disable-line
import 'helpers/translator';

import { Route, Redirect, Switch } from 'react-router-dom';
import { IonApp, IonPage, IonReactRouter, IonRouterOutlet } from '@ionic/react';
import appModel from 'app_model';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import Home from './Home';
import Login from './User/Login';
import Register from './User/Register';
import Reset from './User/Reset';
import Settings from './Settings/Menu';
import InfoMenu from './Info/Menu';
import Credits from './Info/Credits';
import Survey from './Survey';
import LanguageCountrySelectRequired from './Settings/LanguageCountrySelectRequired';
import SplashScreenRequired from './Info/SplashScreenRequired';
import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';
import './common/styles/app.scss';
import './Home/styles.scss';

const App = () => (
  <IonApp>
    <IonReactRouter>
      <Route exact path="/" render={() => <Redirect to="/home/report" />} />
      <LanguageCountrySelectRequired>
        <SplashScreenRequired>
          <IonPage id="main">
            <Switch>
              <Route path="/home" component={Home} />
              <Route path="/survey" component={Survey} />
              <IonRouterOutlet>
                <Route
                  path="/user/login"
                  exact
                  render={() => <Login userModel={userModel} />}
                />
                <Route
                  path="/user/register"
                  exact
                  render={() => <Register userModel={userModel} />}
                />
                <Route
                  path="/user/reset"
                  exact
                  render={() => <Reset userModel={userModel} />}
                />
                <Route
                  path="/info/menu"
                  render={props => (
                    <InfoMenu
                      userModel={userModel}
                      appModel={appModel}
                      savedSamples={savedSamples}
                      {...props}
                    />
                  )}
                />
                <Route path="/info/credits" component={Credits} />
                <Route path="/settings" component={Settings} />
              </IonRouterOutlet>
            </Switch>
          </IonPage>
        </SplashScreenRequired>
      </LanguageCountrySelectRequired>
    </IonReactRouter>
  </IonApp>
);

export default App;
