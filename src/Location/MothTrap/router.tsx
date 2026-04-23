import type { ComponentType } from 'react';
import { Route } from 'react-router';
import SiteList from './List';

type MothTrapRoute = [string, ComponentType<unknown>, boolean?];

const routeDefs: MothTrapRoute[] = [['/location/moth-trap', SiteList, true]];

const routes = routeDefs.map(([route, component]) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
