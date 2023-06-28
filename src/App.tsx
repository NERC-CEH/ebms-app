import { FC } from 'react';
import { observer } from 'mobx-react';
import 'leaflet-draw/dist/images/spritesheet.svg';
import 'leaflet-draw/dist/leaflet.draw.css';

/* Leaflet */
import 'leaflet/dist/leaflet.css';
import { Route, Redirect } from 'react-router-dom';
import { IonApp as IonAppPlain, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import WhatsNewDialog from 'common/Components/WhatsNewDialog';
import 'common/theme.scss';
import 'common/translations/translator';
import appModel from 'models/app';
import LanguageCountrySelectRequired from 'Components/LanguageCountrySelectRequired';
import Home from './Home';
import SplashScreenRequired from './Info/SplashScreenRequired';
import Info from './Info/router';
import Location from './Location/router';
import Settings from './Settings/router';
import Survey from './Survey/router';
import User from './User/router';

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
