import Location from 'models/location';
import Sample from 'models/sample';

const hasLocationMatch = (smp: Sample, mothTrap: Location) =>
  smp.data.locationId === mothTrap.id;

export default hasLocationMatch;
