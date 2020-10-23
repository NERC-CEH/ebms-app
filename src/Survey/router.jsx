import AreaCountRoutes from './AreaCount/router';
import PreciseAreaCountRoutes from './PreciseAreaCount/router';
import TransectRoutes from './Transect/router';

export default [
  ...PreciseAreaCountRoutes,
  ...AreaCountRoutes,
  ...TransectRoutes,
];
