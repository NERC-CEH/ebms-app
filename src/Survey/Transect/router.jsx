import { AttrPage, RouteWithModels } from '@flumens';
import samplesCollection from 'models/collections/samples';
import StartNewSurvey from 'Components/StartNewSurvey';
import withRemoteModels from 'Survey/common/hooks';
import Home from './Home';
import OccurrenceEdit from './OccurrenceEdit';
import SectionsEdit from './Sections/Edit';
import SectionsList from './Sections/List';
import SectionsEditTaxa from './Sections/Taxon';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = '/survey/transect';

const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, withRemoteModels(Home)],
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/sections`, SectionsList],
  [`${baseURL}/:smpId/sections/:subSmpId`, SectionsEdit],
  [`${baseURL}/:smpId/sections/:subSmpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/sections/:subSmpId/taxa`, SectionsEditTaxa],

  [`${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa`, OccurrenceEdit],
  [
    `${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa/:attr`,
    AttrPageFromRoute,
  ],

  [`${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa/taxa`, SectionsEditTaxa],
];

export default RouteWithModels.fromArray(samplesCollection, routes);
