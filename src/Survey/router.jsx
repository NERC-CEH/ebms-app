import AreaCountOldRoutes from './AreaCountOld/router';
import AreaCountRoutes from './AreaCount/router';
import TransectRoutes from './Transect/router';
import MothRoutes from './Moth/router';

export default [
  ...AreaCountRoutes,
  ...AreaCountOldRoutes,
  ...TransectRoutes,
  ...MothRoutes,
];
