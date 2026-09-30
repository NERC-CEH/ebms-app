import type { SampleModel } from '@flumens';
import groups from 'models/collections/groups';
import locations from 'models/collections/locations';

// A section/trap list overrides its site's list, then the project's list.
const getTaxonListCids = (sample: SampleModel): string[] => {
  if (sample.parent) return getTaxonListCids(sample.parent);

  const location = locations.idMap.get(sample.data.locationId || '');
  if (location?.taxonListCids.length) return [...location.taxonListCids];

  const group = groups.idMap.get(sample.data.groupId || '');
  return [...(group?.taxonListCids || [])];
};

export default getTaxonListCids;
