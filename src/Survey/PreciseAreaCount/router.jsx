import React from 'react';
import savedSamples from 'savedSamples';
import appModel from 'appModel';
import userModel from 'userModel';
import { AttrPage, RouteWithModels, ModelLocation } from '@apps';
import StartNewSurvey from 'Components/StartNewSurvey';
import config from 'config';
import Home from './Home';
import OccurrenceHome from './OccurrenceHome';
import SpeciesOccurrences from './SpeciesOccurrences';
import Taxon from './Taxon';
import AreaAttr from './Area';
import Details from './Details';
import survey from './config';

const baseURL = '/survey/precise-area';

const HomeWrap = props => (
  <Home
    appModel={appModel}
    userModel={userModel}
    savedSamples={savedSamples}
    {...props}
  />
);

const ModelLocationWrap = params => (
  <ModelLocation
    appModel={appModel}
    userModel={userModel}
    mapProviderOptions={config.map}
    {...params}
  />
);

const routes = [
  [`${baseURL}/new`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId/edit`, HomeWrap],
  [`${baseURL}/:smpId/edit/:attr`, AttrPage],
  [`${baseURL}/:smpId/edit/area`, AreaAttr],
  [`${baseURL}/:smpId/edit/taxon`, Taxon],
  [`${baseURL}/:smpId/edit/details`, Details],
  [`${baseURL}/:smpId/edit/details/:attr`, AttrPage],
  [`${baseURL}/:smpId/edit/speciesOccurrences/:taxa`, SpeciesOccurrences],
  [`${baseURL}/:smpId/edit/speciesOccurrences/:taxa/taxon`, Taxon],
  [`${baseURL}/:smpId/edit/samples/:subSmpId/occ/:occId/:attr`, AttrPage],
  [`${baseURL}/:smpId/edit/samples/:subSmpId/occ/:occId/taxon`, Taxon],
  [`${baseURL}/:smpId/edit/samples/:subSmpId/location`, ModelLocationWrap],
  [`${baseURL}/:smpId/edit/samples/:subSmpId/occ/:occId`, OccurrenceHome],
];

export default RouteWithModels.fromArray(savedSamples, routes);
