import { Route } from 'react-router';
import SiteList from './List';

const routes = [['/locations/sites', SiteList]] as const;

export default routes.map(([route, component]) => (
  <Route key={route} path={route} component={component} exact />
));
