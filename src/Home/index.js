import React from 'react';
import { Route } from 'react-router-dom';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
} from '@ionic/react';
import { person, add, helpCircle, menu, home } from 'ionicons/icons';
import savedSamples from 'saved_samples';
import PrivateRoute from 'common/Components/PrivateRoute';
import Report from './Report';
import Help from './Help';
import UserSurveys from './Surveys';
import './styles.scss';

const Component = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route path="/home/report" render={Report} exact />
      <Route path="/home/help" component={Help} exact />
      <PrivateRoute
        path="/home/user-surveys"
        component={() => <UserSurveys savedSamples={savedSamples} />}
        exact
      />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="home/report" href="/home/report">
        <IonIcon icon={home} />
        <IonLabel>{t('Home')}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
        <IonIcon icon={person} />
        <IonLabel>{t('Surveys')}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="survey" class="add-survey" href="/survey/new/edit">
        <IonIcon icon={add} />
      </IonTabButton>
      <IonTabButton tab="help" href="/home/help">
        <IonIcon icon={helpCircle} />
        <IonLabel>{t('Help')}</IonLabel>
      </IonTabButton>
      <IonTabButton tab="menu" href="/info/menu">
        <IonIcon icon={menu} />
        <IonLabel>{t('Menu')}</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

Component.propTypes = {};

export default Component;
