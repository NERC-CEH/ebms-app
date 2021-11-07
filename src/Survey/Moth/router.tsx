import { RouteWithModels, AttrPage } from '@apps';
import savedSamples from 'models/savedSamples';
import StartNewSurvey from 'Components/StartNewSurvey';
import Details from './Details';
import Home from './Home';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;
const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/edit`, Details],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
];

export default RouteWithModels.fromArray(savedSamples, routes);
