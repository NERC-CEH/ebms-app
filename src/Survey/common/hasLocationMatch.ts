import Location from 'models/location';
import Sample from 'models/sample';

const hasLocationMatch = (smp: Sample, mothTrap: Location) =>
  smp.attrs.location?.id === mothTrap.id;

export default hasLocationMatch;
