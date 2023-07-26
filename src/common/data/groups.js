import bumblebeeIcon from 'common/images/bumblebee.svg';
import butterflyIcon from 'common/images/butterfly.svg';
import dragonflyIcon from 'common/images/dragonfly.svg';
import mothIcon from 'common/images/moth.svg';

const speciesGroups = {
  butterflies: {
    id: 251,
    label: 'Butterflies',
    value: 'butterflies',
    icon: butterflyIcon,
  },
  moths: { id: 260, label: 'Moths', value: 'moths', icon: mothIcon },
  bumblebees: {
    id: 261,
    label: 'Bumblebees',
    value: 'bumblebees',
    icon: bumblebeeIcon,
  },
  dragonflies: {
    id: 265,
    label: 'Dragonflies',
    value: 'dragonflies',
    icon: dragonflyIcon,
  },
};

export default speciesGroups;
