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
import PrivateRoute from 'common/Components/PrivateRoute';
import Report from './Report';
import Guide from '../Info/Guide';
import User from '../User/Report';
import './styles.scss';

const Component = () => {
  return (
    <>
      <IonPage className="app-home-page">
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/:tab(home/report)" component={Report} exact />
            <Route path="/:tab(home/guide)" component={Guide} exact />
            <Route
              path="/:tab(home/user-report)"
              render={() => <PrivateRoute component={User} />}
              exact
            />
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home/report">
              <IonIcon name="home" />
              <IonLabel>{t('Home')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="guide" href="/home/guide">
              <IonIcon name="book" />
              <IonLabel>{t('Guide')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="survey" class="add-survey" href="/survey/new/edit">
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
