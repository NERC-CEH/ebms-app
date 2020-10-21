import React from 'react';
import { Route } from 'react-router-dom';
import appModel from 'appModel';
import userModel from 'userModel';
import Login from './Login';
import Register from './Register';
import Reset from './Reset';

export default [
  <Route
    path="/user/login"
    key="/user/login"
    exact
    render={props => <Login {...props} userModel={userModel} />}
  />,
  <Route
    path="/user/register"
    key="/user/register"
    exact
    render={props => (
      <Register {...props} userModel={userModel} appModel={appModel} />
    )}
  />,
  <Route
    path="/user/reset"
    key="/user/reset"
    exact
    render={props => <Reset {...props} userModel={userModel} />}
  />,
];
