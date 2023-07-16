import { observer } from 'mobx-react';
import { AttrPage, RouteWithModels, ModelLocationMap } from '@flumens';
import appConfig from 'common/config';
import appModel from 'models/app';
import savedSamples from 'models/collections/samples';
import userModel from 'models/user';
import StartNewSurvey from 'Components/StartNewSurvey';
import Direction from 'Survey/common/Direction';
import AreaAttr from './Area';
import Details from './Details';
import Home from './Home';
import OccurrenceHome from './OccurrenceHome';
import SpeciesOccurrences from './SpeciesOccurrences';
import Taxon from './Taxon';
import survey from './config';
import surveySingleSpecies from './configSpecies';

const { AttrPageFromRoute } = AttrPage;

const HomeWrap = props => (
  <Home
    appModel={appModel}
    userModel={userModel}
    savedSamples={savedSamples}
    {...props}
  />
);

// eslint-disable-next-line @getify/proper-arrows/name
const ModelLocationWrap = observer(props => (
  <ModelLocationMap
    model={props.subSample}
    mapProviderOptions={appConfig.map}
  />
));

const getRoutes = (baseURL, config) => [
  [`${baseURL}`, StartNewSurvey.with(config), true],
  [`${baseURL}/:smpId`, HomeWrap],
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/area`, AreaAttr],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/details`, Details],
  [`${baseURL}/:smpId/details/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/speciesOccurrences/:taxa`, SpeciesOccurrences],
  [`${baseURL}/:smpId/speciesOccurrences/:taxa/taxon`, Taxon],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/taxon`, Taxon],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/direction`, Direction],
  [`${baseURL}/:smpId/samples/:subSmpId/location`, ModelLocationWrap],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId`, OccurrenceHome],
];

const routes = [
  ...getRoutes(`/survey/${survey.name}`, survey),
  ...getRoutes(`/survey/${surveySingleSpecies.name}`, surveySingleSpecies),
];

export default RouteWithModels.fromArray(savedSamples, routes);
