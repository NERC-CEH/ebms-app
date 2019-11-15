import React from 'react';
import { Route } from 'react-router-dom';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  IonFab,
  IonFabButton,
  IonFabList,
} from '@ionic/react';
import { person, add, book, menu, home } from 'ionicons/icons';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import PrivateRoute from 'common/Components/PrivateRoute';
import Report from './Report';
import Species from './Species';
import UserSurveys from './Surveys';
import './styles.scss';

const Component = () => (
  <>
    <IonFab vertical="bottom" horizontal="center" slot="fixed">
      <IonFabList side="top">
        <div className="fab-backdrop" />
      </IonFabList>

      <IonFabButton>
        <IonIcon icon={add} />
      </IonFabButton>

      <IonFabList side="top">
        <IonFabButton
          class="fab-button-label"
          routerLink="/survey/area/new/edit"
        >
          <IonLabel>{t('Timed Area Count')}</IonLabel>
        </IonFabButton>

        <IonFabButton
          class="fab-button-label"
          routerLink="/survey/transect/new/edit"
        >
          <IonLabel>{t('eBMS Transect')}</IonLabel>
        </IonFabButton>
      </IonFabList>
    </IonFab>

    <IonTabs>
      <IonRouterOutlet>
        <Route path="/home/report" component={Report} exact />
        <Route
          path="/home/species"
          render={() => (
            <Species appModel={appModel} savedSamples={savedSamples} />
          )}
          exact
        />
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

        <IonTabButton tab="home/species" href="/home/species">
          <IonIcon icon={book} />
          <IonLabel>{t('Guide')}</IonLabel>
        </IonTabButton>

        <IonTabButton>{/* placeholder */}</IonTabButton>

        <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
          <IonIcon icon={person} />
          <IonLabel>{t('Surveys')}</IonLabel>
        </IonTabButton>

        <IonTabButton tab="menu" href="/info/menu">
          <IonIcon icon={menu} />
          <IonLabel>{t('Menu')}</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </>
);

Component.propTypes = {};

export default Component;
