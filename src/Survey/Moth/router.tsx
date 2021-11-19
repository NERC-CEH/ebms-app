import { RouteWithModels, AttrPage } from '@apps';
import savedSamples from 'models/savedSamples';
import StartNewSurvey from 'Components/StartNewSurvey';
import Details from './Details';
import Home from './Home';
import Taxon from './Taxon';
import Location from './Location';
import Occurrences from './Occurrences';
import OccurrenceHome from './OccurrenceHome';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;
const baseURL = `/survey/${survey.name}`;

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/edit`, Details],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/location`, Location],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/occurrences/:taxa`, Occurrences],
  [`${baseURL}/:smpId/occurrences/:taxa/taxon`, Taxon],
  [`${baseURL}/:smpId/occurrences/occ/:occId`, OccurrenceHome],
  [`${baseURL}/:smpId/occurrences/occ/:occId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/occurrences/occ/:occId/taxon`, Taxon],
];

export default RouteWithModels.fromArray(savedSamples, routes);
