import AreaCountRoutes from './AreaCount/router';
import BaitTrapRoutes from './BaitTrap/router';
import MothTrapRoutes from './MothTrap/router';
import TransectRoutes from './Transect/router';

export default [
  ...AreaCountRoutes,
  ...TransectRoutes,
  ...MothTrapRoutes,
  ...BaitTrapRoutes,
];
