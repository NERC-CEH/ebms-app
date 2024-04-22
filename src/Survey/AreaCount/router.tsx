import { AttrPage, RouteWithModels } from '@flumens';
import samplesCollection from 'models/collections/samples';
import ModelLocationMap from 'Survey/common/ModelLocationMap';
import StartNewSurvey from 'Survey/common/StartNewSurvey';
import { Survey } from 'Survey/common/config';
import withRemoteModels from 'Survey/common/hooks';
import AreaAttr from './Area';
import Details from './Details';
import Groups from './Groups';
import Home from './Home';
import Direction from './Occurrence/Direction';
import OccurrenceHome from './Occurrence/Home';
import SpeciesOccurrences from './Occurrence/Species';
import Taxon from './Taxon';
import survey from './config';
import surveySingleSpecies from './configSpecies';

const { AttrPageFromRoute } = AttrPage;

const getRoutes = (baseURL: string, config: Survey) => [
  [`${baseURL}`, StartNewSurvey.with(config), true],
  [`${baseURL}/:smpId`, withRemoteModels(Home)],
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/area`, AreaAttr],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/details`, Details],
  [`${baseURL}/:smpId/details/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/details/group`, Groups],
  [`${baseURL}/:smpId/speciesOccurrences/:taxa`, SpeciesOccurrences],
  [`${baseURL}/:smpId/speciesOccurrences/:taxa/taxon`, Taxon],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/taxon`, Taxon],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/direction`, Direction],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId`, OccurrenceHome],
  [`${baseURL}/:smpId/samples/:subSmpId/location`, ModelLocationMap],
];

const routes = [
  ...getRoutes(`/survey/${survey.name}`, survey),
  ...getRoutes(`/survey/${surveySingleSpecies.name}`, surveySingleSpecies),
];

export default RouteWithModels.fromArray(samplesCollection, routes, false);
