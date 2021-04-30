import React from 'react';
import savedSamples from 'savedSamples';
import appModel from 'appModel';
import userModel from 'userModel';
import { AttrPage, RouteWithModels } from '@apps';
import StartNewSurvey from 'Components/StartNewSurvey';
import Home from './Home';
import OccurrenceHome from './OccurrenceHome';
import Taxon from './Taxon';
import AreaAttr from './Area';
import Details from './Details';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = '/survey/area';

const routes = [
  [`${baseURL}/new`, StartNewSurvey.with(survey), true],
  [
    `${baseURL}/:smpId/edit`,
    props => (
      <Home
        appModel={appModel}
        userModel={userModel}
        savedSamples={savedSamples}
        {...props}
      />
    ),
  ],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/area`, AreaAttr],
  [`${baseURL}/:smpId/edit/taxa`, Taxon],
  [`${baseURL}/:smpId/edit/details`, Details],
  [`${baseURL}/:smpId/edit/details/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/occ/:occId/taxa`, Taxon],
  [`${baseURL}/:smpId/edit/occ/:occId`, OccurrenceHome],
];

export default RouteWithModels.fromArray(savedSamples, routes);
