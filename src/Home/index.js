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
// import PrivateRoute from 'common/Components/PrivateRoute';
import Report from './Report';
import About from '../Info/About';
import User from '../User/Report';
import './styles.scss';

const Component = () => {
  return (
    <>
      <IonPage className="app-home-page">
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(home/report)" component={Report} exact />
            <Route path="/:tab(home/about)" component={About} exact />
            <Route
              path="/:tab(home/user-report)"
              render={() => <User savedSamples={savedSamples} />}
              exact
            />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home/report">
              <IonIcon name="home" />
              <IonLabel>{t('Home')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="about" href="/home/about">
              <IonIcon name="information-circle" />
              <IonLabel>{t('About')}</IonLabel>
            </IonTabButton>
            <IonTabButton
              tab="survey"
              class="add-survey"
              href="/survey/new/edit"
            >
              <IonIcon name="add" />
            </IonTabButton>
            <IonTabButton tab="user" href="/home/user-report">
              <IonIcon name="person" />
              <IonLabel>{t('Account')}</IonLabel>
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
