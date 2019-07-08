import React from 'react';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonPage,
} from '@ionic/react';
import { Route } from 'react-router-dom';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import PrivateRoute from 'common/Components/PrivateRoute';
import Report from './Report';
import Help from '../Info/Help';
import User from '../User/Report';
import './styles.scss';

const Component = () => {
  return (
    <>
      <IonPage className="app-home-page">
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(home/report)" render={Report} exact />
            <Route path="/:tab(home/help)" component={Help} exact />
            <Route
              path="/:tab(home/user-report)"
              render={() => (
                <PrivateRoute
                  component={() => (
                    <User savedSamples={savedSamples} appModel={appModel} />
                  )}
                />
              )}
              exact
            />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home/report">
              <IonIcon name="home" />
              <IonLabel>{t('Home')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="user" href="/home/user-report">
              <IonIcon name="person" />
              <IonLabel>{t('Account')}</IonLabel>
            </IonTabButton>
            <IonTabButton
              tab="survey"
              class="add-survey"
              href="/survey/new/edit"
            >
              <IonIcon name="add" />
            </IonTabButton>
            <IonTabButton tab="help" href="/home/help">
              <IonIcon name="help-circle" />
              <IonLabel>{t('Help')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="menu" href="/info/menu">
              <IonIcon name="menu" />
              <IonLabel>{t('Menu')}</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonPage>
    </>
  );
};

Component.propTypes = {};

export default Component;
