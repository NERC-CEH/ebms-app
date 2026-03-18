import { useEffect } from 'react';
import {
  personOutline,
  menuOutline,
  statsChartOutline,
  homeOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Route, Redirect } from 'react-router-dom';
import { App as AppPlugin } from '@capacitor/app';
import {
  IonTabs,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonRouterOutlet,
  useIonRouter,
} from '@ionic/react';
import PendingSurveysBadge from 'common/Components/PendingSurveysBadge';
import butterflyIcon from 'common/images/butterfly.svg';
import Home from './Home';
import Menu from './Menu';
import Report from './Report';
import Species from './Species';
import UserSurveys from './UserSurveys';
import './styles.scss';

const HomeController = () => {
  const ionRouter = useIonRouter();

  const exitApp = () => {
    const onExitApp = () => !ionRouter.canGoBack() && AppPlugin.exitApp();

    document.addEventListener('ionBackButton', (ev: any) =>
      ev.detail.register(-1, onExitApp)
    );

    const removeEventListener = () =>
      document.addEventListener('ionBackButton', onExitApp);
    return removeEventListener;
  };
  useEffect(exitApp, []);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/home" to="/home/home" />
        <Route path="/home/home" component={Home} exact />
        <Route path="/home/species" component={Species} exact />
        <Route path="/home/report" component={Report} exact />
        <Route path="/home/user-surveys/:id?" component={UserSurveys} exact />
        <Route path="/home/menu" component={Menu} exact />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home/home" href="/home/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>
            <T>Home</T>
          </IonLabel>
        </IonTabButton>

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

        <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
          <IonIcon icon={personOutline} />
          <IonLabel>
            <PendingSurveysBadge className="absolute bottom-1/3 left-2/4" />
            <T>Surveys</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="menu" href="/home/menu">
          <IonIcon icon={menuOutline} />
          <IonLabel>
            <T>Menu</T>
          </IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default HomeController;
