import { RouteWithModels, AttrPage } from '@apps';
import savedSamples from 'models/savedSamples';
import StartNewSurvey from 'Components/StartNewSurvey';
import Details from './Details';
import config from './config';

const { AttrPageFromRoute } = AttrPage;
const baseURL = '/survey/moth';

const routes = [
  [`${baseURL}/new`, StartNewSurvey.with(config), true],
  [`${baseURL}/:smpId/edit`, Details],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
];

export default RouteWithModels.fromArray(savedSamples, routes);