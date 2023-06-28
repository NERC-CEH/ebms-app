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
  [`${baseURL}/:smpId/edit`, HomeWrap],
  [`${baseURL}/:smpId/edit/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/sections`, SectionListWrap],
  [`${baseURL}/:smpId/edit/sections/:subSmpId`, SectionEditWrap],
  [`${baseURL}/:smpId/edit/sections/:subSmpId/:attr`, AttrPageFromRoute],
  [`${baseURL}/:smpId/edit/sections/:subSmpId/taxa`, SectionsEditTaxa],

  [
    `${baseURL}/:smpId/edit/sections/:subSmpId/:occId/edit/:taxa`,
    OccurrenceEdit,
  ],
  [
    `${baseURL}/:smpId/edit/sections/:subSmpId/:occId/edit/:taxa/:attr`,
    AttrPageFromRoute,
  ],

  [
    `${baseURL}/:smpId/edit/sections/:subSmpId/:occId/edit/:taxa/taxa`,
    SectionsEditTaxa,
  ],
];

export default RouteWithModels.fromArray(savedSamples, routes);
