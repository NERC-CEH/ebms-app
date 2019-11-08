import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import AreaCount from './AreaCount';
import Transect from './Transect';

const App = () => {
  if (!userModel.hasLogIn()) {
    return <Redirect push to="/user/login" />;
  }

  return (
    <>
      <Route
        path="/survey/area/:id"
        render={props => (
          <AreaCount
            savedSamples={savedSamples}
            appModel={appModel}
            {...props}
          />
        )}
      />
      <Route
        path="/survey/transect/:id"
        render={props => (
          <Transect
            savedSamples={savedSamples}
            appModel={appModel}
            userModel={userModel}
            {...props}
          />
        )}
      />
    </>
  );
};
export default App;
