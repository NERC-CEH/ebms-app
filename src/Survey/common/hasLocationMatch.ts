import Sample from 'models/sample';
import Location from 'models/location';

const hasLocationMatch = (smp: typeof Sample, mothTrap: Location) =>
  smp.attrs.location?.cid === mothTrap.cid;

export default hasLocationMatch;
