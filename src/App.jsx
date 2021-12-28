import React, { useContext } from 'react';
import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, NavContext } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import appModel from 'appModel';
import { observer } from 'mobx-react';
import WhatsNewDialog from 'common/Components/WhatsNewDialog';
import LanguageCountrySelectRequired from 'Components/LanguageCountrySelectRequired';
import SplashScreenRequired from './Info/SplashScreenRequired';
import Home from './Home';
import Info from './Info/router';
import User from './User/router';
import Settings from './Settings/router';
import Survey from './Survey/router';
import 'common/translations/translator';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Leaflet */
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/images/spritesheet.svg';

import 'common/theme.scss';

const HomeRedirect = () => {
  const { navigate } = useContext(NavContext);
  navigate('/home/report', 'root'); // simple redirect component doesn't work when back from login
  return null;
};

const App = () => {
  const { showWhatsNewInVersion115, language } = appModel.attrs;

  return (
    <IonApp lang={language}>
      <IonReactRouter>
        <LanguageCountrySelectRequired appModel={appModel}>
          <SplashScreenRequired appModel={appModel}>
            {showWhatsNewInVersion115 && <WhatsNewDialog appModel={appModel} />}
            <IonRouterOutlet id="main">
              <Route path="/home" component={Home} />
              {Info}
              {User}
              {Survey}
              {Settings}
              <Route exact path="/" component={HomeRedirect} />
            </IonRouterOutlet>
          </SplashScreenRequired>
        </LanguageCountrySelectRequired>
      </IonReactRouter>
    </IonApp>
  );
};

export default observer(App);
