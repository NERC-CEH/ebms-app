import { observer } from 'mobx-react';
import { Route, Redirect } from 'react-router-dom';
import {
  SamplesContext,
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
import samples from 'common/models/collections/samples';
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

const samplesContext = { samples };

const HomeRedirect = () => <Redirect to="home" />;

const App = () => {
  const { language } = appModel.data;

  return (
    <IonApp lang={language as any}>
      <LanguageCountrySelectRequired appModel={appModel}>
        <TailwindContext.Provider value={tailwindContext}>
          <TailwindBlockContext.Provider value={tailwindBlockContext}>
            <SamplesContext.Provider value={samplesContext}>
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
            </SamplesContext.Provider>
          </TailwindBlockContext.Provider>
        </TailwindContext.Provider>
      </LanguageCountrySelectRequired>
    </IonApp>
  );
};

export default observer(App);
