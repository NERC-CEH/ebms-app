import { observer } from 'mobx-react';
import { Route, Redirect } from 'react-router-dom';
import {
  TailwindBlockContext,
  TailwindContext,
  TailwindContextValue,
  defaultContext,
} from '@flumens';
import {
  IonApp as IonAppPlain,
  IonRouterOutlet,
  isPlatform,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import WhatsNewDialog from 'common/Components/WhatsNewDialog';
import 'common/theme.scss';
import 'common/translations/translator';
import appModel from 'models/app';
import LanguageCountrySelectRequired from 'Components/LanguageCountrySelectRequired';
import Home from './Home';
import Onboarding from './Info/Onboarding';
import Info from './Info/router';
import Location from './Location/router';
import Settings from './Settings/router';
import Survey from './Survey/router';
import User from './User/router';

const IonApp = IonAppPlain as any; // IonApp has 'lang' prop missing.

const platform = isPlatform('ios') ? 'ios' : 'android';
const tailwindContext: TailwindContextValue = { platform };
const tailwindBlockContext = {
  ...defaultContext,
  ...tailwindContext,
  basePath: '',
};

const HomeRedirect = () => <Redirect to="home" />;

const App = () => {
  const { language } = appModel.attrs;

  return (
    <IonApp lang={language as any}>
      <LanguageCountrySelectRequired appModel={appModel}>
        <TailwindContext.Provider value={tailwindContext}>
          <TailwindBlockContext.Provider value={tailwindBlockContext}>
            <Onboarding>
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
            </Onboarding>
          </TailwindBlockContext.Provider>
        </TailwindContext.Provider>
      </LanguageCountrySelectRequired>
    </IonApp>
  );
};

export default observer(App);
