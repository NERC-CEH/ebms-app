import React from 'react';
import savedSamples from 'savedSamples';
import appModel from 'appModel';
import userModel from 'userModel';
import { AttrPage, RouteWithModels, ModelLocation } from '@apps';
import StartNewSurvey from 'Components/StartNewSurvey';
import { observer } from 'mobx-react';
import config from 'config';
import Home from './Home';
import OccurrenceHome from './OccurrenceHome';
import SpeciesOccurrences from './SpeciesOccurrences';
import Taxon from './Taxon';
import AreaAttr from './Area';
import Details from './Details';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = '/survey/precise-area';

const HomeWrap = props => (
  <Home
    appModel={appModel}
    userModel={userModel}
    savedSamples={savedSamples}
    {...props}
  />
);

const ModelLocationWrap = observer(props => (
  <ModelLocation model={props.subSample} mapProviderOptions={config.map} />
));

const routes = [
  [`${baseURL}/new`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId/edit`, HomeWrap],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/area`, AreaAttr],
  [`${baseURL}/:smpId/edit/taxon`, Taxon],
  [`${baseURL}/:smpId/edit/details`, Details],
  [`${baseURL}/:smpId/edit/details/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/speciesOccurrences/:taxa`, SpeciesOccurrences],
  [`${baseURL}/:smpId/edit/speciesOccurrences/:taxa/taxon`, Taxon],
  [
    `${baseURL}/:smpId/edit/samples/:subSmpId/occ/:occId/:attr`,
    AttrPageFromRoute,
  ],
  [`${baseURL}/:smpId/edit/samples/:subSmpId/occ/:occId/taxon`, Taxon],
  [`${baseURL}/:smpId/edit/samples/:subSmpId/location`, ModelLocationWrap],
  [`${baseURL}/:smpId/edit/samples/:subSmpId/occ/:occId`, OccurrenceHome],
];

export default RouteWithModels.fromArray(savedSamples, routes);
