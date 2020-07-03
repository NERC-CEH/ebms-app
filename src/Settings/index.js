import React from 'react';
import { Route } from 'react-router-dom';
import appModel from 'app_model';
import userModel from 'user_model';
import Menu from './Menu';
import Language from './Language';
import Country from './Country';
import PrimarySurvey from './PrimarySurvey';

export default [
  <Route
    path="/settings/menu"
    key="/settings/menu"
    exact
    render={() => <Menu userModel={userModel} appModel={appModel} />}
  />,
  <Route
    path="/settings/language"
    key="/settings/language"
    exact
    render={() => <Language userModel={userModel} appModel={appModel} />}
  />,
  <Route
    path="/settings/country"
    key="/settings/country"
    exact
    render={() => <Country userModel={userModel} appModel={appModel} />}
  />,
  <Route
    path="/settings/primary-survey"
    key="/settings/primary-survey"
    exact
    render={() => <PrimarySurvey userModel={userModel} appModel={appModel} />}
  />,
];
