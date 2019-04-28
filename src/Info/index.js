import React from 'react';
import { Route } from 'react-router-dom';
import appModel from 'app_model';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import InfoMenu from './Menu';
import About from './About';
import Credits from './Credits';
import PrivacyPolicy from './PrivacyPolicy';
import Help from './Help';

const App = () => (
  <>
    <Route
      path="/info/menu"
      render={props => (
        <InfoMenu
          userModel={userModel}
          appModel={appModel}
          savedSamples={savedSamples}
          {...props}
        />
      )}
    />
    <Route path="/info/about" component={About} />
    <Route path="/info/credits" component={Credits} />
    <Route path="/info/privacy" component={PrivacyPolicy} />
    <Route path="/info/help" component={Help} />
  </>
);

export default App;
