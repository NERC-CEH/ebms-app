import Location from 'models/location';
import Sample, { MothTrapLocation } from 'models/sample';

const hasLocationMatch = (smp: Sample, mothTrap: Location) =>
  (smp.attrs.location as MothTrapLocation)?.id === mothTrap.id;

export default hasLocationMatch;
