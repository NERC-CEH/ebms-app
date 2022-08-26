import { useContext, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  IonFabButton,
  IonFabList,
  NavContext,
  useIonRouter,
} from '@ionic/react';
import {
  personOutline,
  addOutline,
  menuOutline,
  statsChartOutline,
} from 'ionicons/icons';
import savedSamples from 'models/collections/samples';
import appModel from 'models/app';
import userModel from 'models/user';
import { App as AppPlugin } from '@capacitor/app';

import LongPressFabButton from 'Components/LongPressFabButton';
import { Trans as T } from 'react-i18next';
import PendingSurveysBadge from 'common/Components/PendingSurveysBadge';
import surveys from 'common/config/surveys';
import butterflyIcon from 'common/images/butterfly.svg';
import Report from './Report';
import Species from './Species';
import UserSurveys from './UserSurveys';
import Menu from './Menu';
import './styles.scss';

const UserSurveysTab = () => <UserSurveys savedSamples={savedSamples} />;
const ReportTab = props => <Report appModel={appModel} {...props} />;
const SpeciesTab = () => (
  <Species
    appModel={appModel}
    userModel={userModel}
    savedSamples={savedSamples}
  />
);

const HomeController = () => {
  const { navigate } = useContext(NavContext);
  const ionRouter = useIonRouter();

  const exitApp = () => {
    const onExitApp = () => !ionRouter.canGoBack() && AppPlugin.exitApp();

    // eslint-disable-next-line @getify/proper-arrows/name
    document.addEventListener('ionBackButton', ev =>
      ev.detail.register(-1, onExitApp)
    );

    const removeEventListener = () =>
      document.addEventListener('ionBackButton', onExitApp);
    return removeEventListener;
  };
  useEffect(exitApp, []);

  const navigateToPrimarySurvey = () => {
    const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

    navigate(`/survey/${primarySurveyName}`);
  };

  const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

  const getOtherSurveys = () => {
    const notPrimarySurvey = ({ name }) => name !== primarySurveyName;
    const notDeprecatedSurvey = ({ deprecated }) => !deprecated;
    const otherSurveys = Object.values(surveys)
      .filter(notPrimarySurvey)
      .filter(notDeprecatedSurvey);

    // eslint-disable-next-line
    const getSurveyButton = ({ name, label }) => {
      if (!surveys[name]) return null; // for backwards compatible

      return (
        <IonFabButton
          class="fab-button-label"
          routerLink={`/survey/${name}`}
          key={name}
        >
          <IonLabel>
            <T>{label}</T>
          </IonLabel>
        </IonFabButton>
      );
    };

    return otherSurveys.map(getSurveyButton);
  };

  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/home" to="/home/species" />
          <Route path="/home/species" render={SpeciesTab} exact />
          <Route path="/home/report" render={ReportTab} exact />
          <Route path="/home/user-surveys" render={UserSurveysTab} exact />
          <Route path="/home/menu" component={Menu} exact />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home/species" href="/home/species">
            <IonIcon icon={butterflyIcon} />
            <IonLabel>
              <T>Guide</T>
            </IonLabel>
          </IonTabButton>

          <IonTabButton tab="home/report" href="/home/report">
            <IonIcon icon={statsChartOutline} />
            <IonLabel>
              <T>Reports</T>
            </IonLabel>
          </IonTabButton>

          <IonTabButton>
            <LongPressFabButton
              onClick={navigateToPrimarySurvey}
              icon={addOutline}
            >
              <IonFabList side="top">
                {getOtherSurveys()}

                <div className="long-press-surveys-label">
                  <T>Click on other recording options from list below</T>
                </div>
              </IonFabList>
            </LongPressFabButton>
          </IonTabButton>

          <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
            <IonIcon icon={personOutline} />
            <IonLabel>
              <T>Surveys</T>
            </IonLabel>
            <PendingSurveysBadge savedSamples={savedSamples} />
          </IonTabButton>

          <IonTabButton tab="menu" href="/home/menu">
            <IonIcon icon={menuOutline} />
            <IonLabel>
              <T>Menu</T>
            </IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default HomeController;
