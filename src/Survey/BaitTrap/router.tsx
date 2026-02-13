import { Route } from 'react-router-dom';
import { AttrPage, withSample } from '@flumens';
import StartNewSurvey from 'Survey/common/StartNewSurvey';
import Details from './Details';
import Home from './Home';
import Location from './Location';
import Occurrence from './Occurrence';
import Taxon from './Taxon';
import Trap from './Trap';
import TrapDetails from './TrapDetails';
import TrapPicker from './TrapPicker';
import survey from './config';

const { AttrPageFromRoute } = AttrPage;
const baseURL = `/survey/${survey.name}`;

const routes = [
  [baseURL, StartNewSurvey.with(survey), true],
  [`${baseURL}/:smpId`, Home],
  [`${baseURL}/:smpId/details`, Details],
  [`${baseURL}/:smpId/details/:attr`, withSample(AttrPageFromRoute)],
  [`${baseURL}/:smpId/details/location`, Location],
  [`${baseURL}/:smpId/traps`, TrapPicker],
  [`${baseURL}/:smpId/traps/:subSmpId`, Trap],
  [`${baseURL}/:smpId/traps/:subSmpId/details`, TrapDetails],
  [
    `${baseURL}/:smpId/traps/:subSmpId/details/:attr`,
    withSample(AttrPageFromRoute),
  ],
  [`${baseURL}/:smpId/traps/:subSmpId/taxon`, Taxon],
  [`${baseURL}/:smpId/traps/:subSmpId/occ/:occId`, Occurrence],
  [
    `${baseURL}/:smpId/traps/:subSmpId/occ/:occId/:attr`,
    withSample(AttrPageFromRoute),
  ],
  [`${baseURL}/:smpId/traps/:subSmpId/occ/:occId/taxon`, Taxon],
].map(([route, component]: any) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
