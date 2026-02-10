import { Route } from 'react-router';
import SiteList from './List';

const routes = [['/locations/sites', SiteList]].map(
  ([route, component]: any) => (
    <Route key={route} path={route} component={component} exact />
  )
);

export default routes;
