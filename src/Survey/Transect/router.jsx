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

const baseURL = '/survey/transect';

const routes = [
  [`${baseURL}/new`, StartNewSurvey.with(survey), true],
  [
    `${baseURL}/:smpId/edit`,
    props => (
      <Home appModel={appModel} savedSamples={savedSamples} {...props} />
    ),
  ],
  [`${baseURL}/:smpId/edit/:attr`, AttrPage],
  [
    `${baseURL}/:smpId/edit/sections`,
    props => (
      <SectionsList {...props} appModel={appModel} userModel={userModel} />
    ),
  ],
  [
    `${baseURL}/:smpId/edit/sections/:subSmpId`,
    props => <SectionsEdit {...props} appModel={appModel} />,
  ],
  [`${baseURL}/:smpId/edit/sections/:subSmpId/:attr`, AttrPage],
  [`${baseURL}/:smpId/edit/sections/:subSmpId/taxa`, SectionsEditTaxa],
];

export default RouteWithModels.fromArray(savedSamples, routes);