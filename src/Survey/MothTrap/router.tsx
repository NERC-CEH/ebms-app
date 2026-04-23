import Location from 'Location/MothTrap/List';
import { Route } from 'react-router-dom';
import { withSample, AttrPage } from '@flumens';
import Groups from 'Survey/common/Groups';
import ModelLocationMap from 'Survey/common/ModelLocationMap';
import StartNewSurvey from 'Survey/common/StartNewSurvey';
import Details from './Details';
import EndWeather from './Details/EndWeather';
import StartWeather from './Details/StartWeather';
import Home from './Home';
import OccurrenceHome from './Occurrence';
import Taxon from './Taxon';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;
const baseURL = `/survey/${survey.name}`;

const routes = [
  [baseURL, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/details`, Details],
  [`${baseURL}/:smpId/details/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/details/group`, Groups],
  [`${baseURL}/:smpId/details/endWeather`, EndWeather],
  [`${baseURL}/:smpId/details/endWeather/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/details/startWeather`, StartWeather],
  [
    `${baseURL}/:smpId/details/startWeather/:attr`,
    withSample(AttrPageFromRoute),
  ],
  [`${baseURL}/:smpId/details/trap`, Location],
  [`${baseURL}/:smpId/details/location`, ModelLocationMap],
  [`${baseURL}/:smpId/taxon`, Taxon],
  [`${baseURL}/:smpId/occ/:occId`, OccurrenceHome],
  [`${baseURL}/:smpId/occ/:occId/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/occ/:occId/taxon`, Taxon],
].map(([route, component]: any) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
