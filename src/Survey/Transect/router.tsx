import { Route } from 'react-router-dom';
import { AttrPage, withSample } from '@flumens';
import StartNewSurvey from 'Survey/common/StartNewSurvey';
import Home from './Home';
import OccurrenceEdit from './OccurrenceEdit';
import SectionsEdit from './Sections/Edit';
import SectionsList from './Sections/List';
import SectionsEditTaxa from './Sections/Taxon';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = '/survey/transect';

const routes = [
  [baseURL, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/sections`, SectionsList],
  [`${baseURL}/:smpId/sections/:subSmpId`, SectionsEdit],
  [`${baseURL}/:smpId/sections/:subSmpId/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/sections/:subSmpId/taxa`, SectionsEditTaxa],

  [`${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa`, OccurrenceEdit],
  [
    `${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa/:attr`,
    withSample(AttrPageFromRoute),
  ],

  [`${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa/taxa`, SectionsEditTaxa],
].map(([route, component]: any) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
