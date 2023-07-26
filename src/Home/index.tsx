import { useContext, useEffect, useState } from 'react';
import {
  personOutline,
  addOutline,
  menuOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Route, Redirect } from 'react-router-dom';
import { App as AppPlugin } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LongPressFabButton } from '@flumens';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  IonFabButton,
  NavContext,
  useIonRouter,
  isPlatform,
} from '@ionic/react';
import PendingSurveysBadge from 'common/Components/PendingSurveysBadge';
import butterflyIcon from 'common/images/butterfly.svg';
import appModel from 'models/app';
import samplesCollection from 'models/collections/samples';
import { surveyConfigs as surveys } from 'models/sample';
import userModel from 'models/user';
import { Survey } from 'Survey/common/config';
import Menu from './Menu';
import Report from './Report';
import Species from './Species';
import UserSurveys from './UserSurveys';
import './styles.scss';

const ReportTab = () => <Report appModel={appModel} userModel={userModel} />;
const SpeciesTab = () => <Species appModel={appModel} />;

const HomeController = () => {
  const { navigate } = useContext(NavContext);
  const ionRouter = useIonRouter();
  // prevent fast tapping
  const [isButtonTapped, setIsButtonTapped] = useState(false);

  const exitApp = () => {
    const onExitApp = () => !ionRouter.canGoBack() && AppPlugin.exitApp();

    // eslint-disable-next-line @getify/proper-arrows/name
    document.addEventListener('ionBackButton', (ev: any) =>
      ev.detail.register(-1, onExitApp)
    );

    const removeEventListener = () =>
      document.addEventListener('ionBackButton', onExitApp);
    return removeEventListener;
  };
  useEffect(exitApp, []);

  const navigateToPrimarySurvey = () => {
    const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

    if (!isButtonTapped) {
      setIsButtonTapped(true);
      navigate(`/survey/${primarySurveyName}`);
    }
  };

  const primarySurveyName = appModel.attrs.primarySurvey || 'precise-area';

  const getOtherSurveys = () => {
    const notPrimarySurvey = ({ name }: Survey) => name !== primarySurveyName;
    const notDeprecatedSurvey = ({ deprecated }: Survey) => !deprecated;
    const otherSurveys = Object.values(surveys)
      .filter(notPrimarySurvey)
      .filter(notDeprecatedSurvey);

    // eslint-disable-next-line
    const getSurveyButton = ({ name, label }: any) => {
      if (!surveys[name]) return null; // for backwards compatible

      return (
        <IonFabButton
          className="fab-button-label"
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

  const vibrate = () =>
    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });

  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect exact path="/home" to="/home/species" />
          <Route path="/home/species" render={SpeciesTab} exact />
          <Route path="/home/report" render={ReportTab} exact />
          <Route path="/home/user-surveys/:id?" component={UserSurveys} exact />
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
              onLongClick={vibrate}
            >
              <div className="long-press-surveys-label">
                <T>Click on other recording options from list below</T>
              </div>

              {getOtherSurveys()}
            </LongPressFabButton>
          </IonTabButton>

          <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
            <IonIcon icon={personOutline} />
            <IonLabel>
              <T>Surveys</T>
            </IonLabel>
            <PendingSurveysBadge samplesCollection={samplesCollection} />
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
