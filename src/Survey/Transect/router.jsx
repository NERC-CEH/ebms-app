import { AttrPage, RouteWithModels } from '@flumens';
import appModel from 'models/app';
import savedSamples from 'models/collections/samples';
import userModel from 'models/user';
import StartNewSurvey from 'Components/StartNewSurvey';
import Home from './Home';
import OccurrenceEdit from './OccurrenceEdit';
import SectionsEdit from './Sections/Edit';
import SectionsList from './Sections/List';
import SectionsEditTaxa from './Sections/Taxon';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;

const baseURL = '/survey/transect';

const HomeWrap = props => (
  <Home appModel={appModel} savedSamples={savedSamples} {...props} />
);
const SectionListWrap = props => (
  <SectionsList {...props} appModel={appModel} userModel={userModel} />
);
const SectionEditWrap = props => (
  <SectionsEdit {...props} appModel={appModel} />
);
const routes = [
  [`${baseURL}`, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, HomeWrap],
  [`${baseURL}/:smpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/sections`, SectionListWrap],
  [`${baseURL}/:smpId/sections/:subSmpId`, SectionEditWrap],
  [`${baseURL}/:smpId/sections/:subSmpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/sections/:subSmpId/taxa`, SectionsEditTaxa],

  [`${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa`, OccurrenceEdit],
  [
    `${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa/:attr`,
    AttrPageFromRoute,
  ],

  [`${baseURL}/:smpId/sections/:subSmpId/:occId/:taxa/taxa`, SectionsEditTaxa],
];

export default RouteWithModels.fromArray(savedSamples, routes);
