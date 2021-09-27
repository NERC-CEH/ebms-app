import React from 'react';
import { Route } from 'react-router-dom';
import appModel from 'appModel';
import Credits from './Credits';
import About from './About';
import Help from './Help';
import Guide from './Guide';

const AboutWrap = () => <About appModel={appModel} />;
export default [
  <Route path="/info/help" key="/info/help" exact component={Help} />,
  <Route path="/info/credits" key="/info/credits" exact component={Credits} />,
  <Route path="/info/about" key="/info/about" exact component={AboutWrap} />,
  <Route path="/info/guide" key="/info/guide" exact component={Guide} />,
];
