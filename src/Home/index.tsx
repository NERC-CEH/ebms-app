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
    const onBackButton = (ev: Event) => {
      const e = ev as CustomEvent<{
        register: (p: number, fn: () => void) => void;
      }>;
      e.detail.register(-1, onExitApp);
    };

    document.addEventListener('ionBackButton', onBackButton);
    return () => document.removeEventListener('ionBackButton', onBackButton);
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
            <T>home.home</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="home/species" href="/home/species">
          <IonIcon icon={butterflyIcon} />
          <IonLabel>
            <T>common.guide</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="home/report" href="/home/report">
          <IonIcon icon={statsChartOutline} />
          <IonLabel>
            <T>home.reports</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="/home/user-surveys" href="/home/user-surveys">
          <IonIcon icon={personOutline} />
          <IonLabel>
            <PendingSurveysBadge className="absolute bottom-1/3 left-2/4" />
            <T>common.surveys</T>
          </IonLabel>
        </IonTabButton>

        <IonTabButton tab="menu" href="/home/menu">
          <IonIcon icon={menuOutline} />
          <IonLabel>
            <T>common.menu</T>
          </IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default HomeController;
