import React from 'react';
import { Route } from 'react-router-dom';
import userModel from 'user_model';
import Login from './Login';
import Register from './Register';
import Reset from './Reset';

const App = () => (
  <>
    <Route path="/user/login" render={() => <Login userModel={userModel} />} />
    <Route
      path="/user/register"
      render={() => <Register userModel={userModel} />}
    />
    <Route path="/user/reset" render={() => <Reset userModel={userModel} />} />
  </>
);

export default App;
