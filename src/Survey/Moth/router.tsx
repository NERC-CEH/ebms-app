import { RouteWithModels, AttrPage } from '@flumens';
import savedSamples from 'models/collections/samples';
import StartNewSurvey from 'Components/StartNewSurvey';
import Details from './Details';
import StartWeather from './Details/StartWeather';
import EndWeather from './Details/EndWeather';
import Home from './Home';
import Taxon from './Taxon';
import Location from './Location';
import OccurrenceHome from './OccurrenceHome';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;
const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/edit`, Details],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/endWeather`, EndWeather],
  [`${baseURL}/:smpId/edit/endWeather/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/startWeather`, StartWeather],
  [`${baseURL}/:smpId/edit/startWeather/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/location`, Location],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/occ/:occId`, OccurrenceHome],
  [`${baseURL}/:smpId/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/occ/:occId/taxon`, Taxon],
];

export default RouteWithModels.fromArray(savedSamples, routes);
