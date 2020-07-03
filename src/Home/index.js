import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  IonFabButton,
  IonFabList,
} from '@ionic/react';
import { person, add, book, menu, home } from 'ionicons/icons';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import LongPressFabButton from 'Lib/LongPressFabButton';
import PrivateRoute from 'Lib/PrivateRoute';
import { Trans as T } from 'react-i18next';
import surveys from 'common/config/surveys';
import Report from './Report';
import Species from './Species';
import UserSurveys from './Surveys';
import './styles.scss';

const Component = ({ history }) => {
  const primarySurveyName = appModel.attrs.primarySurvey || 'area';

  const navigateToPrimarySurvey = () =>
    history.push(`/survey/${primarySurveyName}/new/edit`);

  const getOtherSurveys = () => {
    const otherSurveys = Object.values(surveys).filter(
      ({ name }) => name !== primarySurveyName
    );

    // eslint-disable-next-line
    const getSurveyButton = ({ name, label }) => (
      <IonFabButton
        class="fab-button-label"
        routerLink={`/survey/${name}/new/edit`}
      >
        <IonLabel>
          <T>{label}</T>
        </IonLabel>
      </IonFabButton>
    );

    return otherSurveys.map(getSurveyButton);
  };

  return (
    <>
      <LongPressFabButton onClick={navigateToPrimarySurvey} icon={add}>
        <IonFabList side="top">
          {getOtherSurveys()}

          <div className="long-press-surveys-label">
            <T>Click on other recording options from list below</T>
          </div>
        </IonFabList>
      </LongPressFabButton>

      <IonTabs>
        <IonRouterOutlet>
          <Route
            path="/home/report"
            render={props => <Report appModel={appModel} {...props} />}
            exact
          />
          <Route
            path="/home/species"
            render={() => (
              <Species appModel={appModel} savedSamples={savedSamples} />
            )}
            exact
          />
          <PrivateRoute
            path="/home/user-surveys"
            userModel={userModel}
            component={() => <UserSurveys savedSamples={savedSamples} />}
            exact
          />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home/report" href="/home/report">
            <IonIcon icon={home} />
            <IonLabel>
              <T>Home</T>
            </IonLabel>
          </IonTabButton>

          <IonTabButton tab="home/species" href="/home/species">
            <IonIcon icon={book} />
            <IonLabel>
              <T>Guide</T>
            </IonLabel>
          </IonTabButton>

          <IonTabButton>{/* placeholder */}</IonTabButton>

          <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
            <IonIcon icon={person} />
            <IonLabel>
              <T>Surveys</T>
            </IonLabel>
          </IonTabButton>

          <IonTabButton tab="menu" href="/info/menu">
            <IonIcon icon={menu} />
            <IonLabel>
              <T>Menu</T>
            </IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

Component.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Component;
