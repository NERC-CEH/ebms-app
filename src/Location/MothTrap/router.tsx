import { Route } from 'react-router';
import SiteList from './List';

const routeDefs = [['/location/moth-trap', SiteList, true]] as const;

const routes = routeDefs.map(([route, component]) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
