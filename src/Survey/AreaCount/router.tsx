import { AttrPage, RouteWithModels } from '@flumens';
import samplesCollection from 'models/collections/samples';
import StartNewSurvey from 'Components/StartNewSurvey';
import Direction from 'Survey/common/Direction';
import ModelLocationMap from 'Survey/common/ModelLocationMap';
import { Survey } from 'Survey/common/config';
import withRemoteModels from 'Survey/common/hooks';
import AreaAttr from './Area';
import Details from './Details';
import Home from './Home';
import OccurrenceHome from './OccurrenceHome';
import SpeciesOccurrences from './SpeciesOccurrences';
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
  [`${baseURL}/:smpId/speciesOccurrences/:taxa`, SpeciesOccurrences],
  [`${baseURL}/:smpId/speciesOccurrences/:taxa/taxon`, Taxon],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/taxon`, Taxon],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId/direction`, Direction],
  [`${baseURL}/:smpId/samples/:subSmpId/location`, ModelLocationMap],
  [`${baseURL}/:smpId/samples/:subSmpId/occ/:occId`, OccurrenceHome],
];

const routes = [
  ...getRoutes(`/survey/${survey.name}`, survey),
  ...getRoutes(`/survey/${surveySingleSpecies.name}`, surveySingleSpecies),
];

export default RouteWithModels.fromArray(samplesCollection, routes, false);
