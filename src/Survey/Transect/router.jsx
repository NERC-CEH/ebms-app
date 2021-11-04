import React from 'react';
import savedSamples from 'savedSamples';
import appModel from 'appModel';
import userModel from 'userModel';
import { AttrPage, RouteWithModels } from '@apps';
import StartNewSurvey from 'Components/StartNewSurvey';
import Home from './Home';
import SectionsList from './Sections/List';
import SectionsEdit from './Sections/Edit';
import SectionsEditTaxa from './Sections/Taxon';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = '/survey/transect';

const HomeWrap = props => (
  <Home appModel={appModel} savedSamples={savedSamples} {...props} />
);
const SectionListWrap = props => (
  <SectionsList {...props} appModel={appModel} userModel={userModel} />
);
const SectionEditWrap = props => (
  <SectionsEdit {...props} appModel={appModel} />
);
const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId/edit`, HomeWrap],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/sections`, SectionListWrap],
  [`${baseURL}/:smpId/edit/sections/:subSmpId`, SectionEditWrap],
  [`${baseURL}/:smpId/edit/sections/:subSmpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/sections/:subSmpId/taxa`, SectionsEditTaxa],
];

export default RouteWithModels.fromArray(savedSamples, routes);
