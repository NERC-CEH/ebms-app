import AreaCountOldRoutes from './AreaCountOld/router';
import PreciseAreaCountRoutes from './PreciseAreaCount/router';
import TransectRoutes from './Transect/router';

export default [
  ...PreciseAreaCountRoutes,
  ...AreaCountOldRoutes,
  ...TransectRoutes,
];
