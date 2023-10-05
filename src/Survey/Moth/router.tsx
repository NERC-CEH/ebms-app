import { RouteWithModels, AttrPage } from '@flumens';
import samplesCollection from 'models/collections/samples';
import StartNewSurvey from 'Components/StartNewSurvey';
import withRemoteModels from 'Survey/common/hooks';
import Details from './Details';
import EndWeather from './Details/EndWeather';
import StartWeather from './Details/StartWeather';
import Home from './Home';
import Location from './Location';
import OccurrenceHome from './OccurrenceHome';
import Taxon from './Taxon';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;
const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, withRemoteModels(Home)],
  [`${baseURL}/:smpId/details`, Details],
  [`${baseURL}/:smpId/details/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/details/endWeather`, EndWeather],
  [`${baseURL}/:smpId/details/endWeather/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/details/startWeather`, StartWeather],
  [`${baseURL}/:smpId/details/startWeather/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/details/location`, Location],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/occ/:occId`, OccurrenceHome],
  [`${baseURL}/:smpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/occ/:occId/taxon`, Taxon],
];

export default RouteWithModels.fromArray(samplesCollection, routes, false);
