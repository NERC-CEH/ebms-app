import { FC } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { IonApp as IonAppPlain, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import appModel from 'models/app';
import { observer } from 'mobx-react';
import WhatsNewDialog from 'common/Components/WhatsNewDialog';
import LanguageCountrySelectRequired from 'Components/LanguageCountrySelectRequired';
import SplashScreenRequired from './Info/SplashScreenRequired';
import Home from './Home';
import Info from './Info/router';
import User from './User/router';
import Settings from './Settings/router';
import Survey from './Survey/router';
import Location from './Location/router';
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

const IonApp = IonAppPlain as any as FC<{ lang: any }>; // IonApp has 'lang' prop missing.

const HomeRedirect = () => <Redirect to="home" />;

const App = () => {
  const { language } = appModel.attrs;

  return (
    <IonApp lang={language}>
      <LanguageCountrySelectRequired appModel={appModel}>
        <SplashScreenRequired>
          <WhatsNewDialog appModel={appModel} />
          <IonReactRouter>
            <IonRouterOutlet id="main">
              <Route exact path="/" component={HomeRedirect} />
              <Route path="/home" component={Home} />
              {Info}
              {User}
              {Survey}
              {Location}
              {Settings}
            </IonRouterOutlet>
          </IonReactRouter>
        </SplashScreenRequired>
      </LanguageCountrySelectRequired>
    </IonApp>
  );
};

export default observer(App);
