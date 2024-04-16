import { IonIcon } from '@ionic/react';
import bumblebeeIcon from 'common/images/bumblebee.svg';
import butterflyIcon from 'common/images/butterfly.svg';
import dragonflyIcon from 'common/images/dragonfly.svg';
import mothIcon from 'common/images/moth.svg';

const speciesGroups = {
  butterflies: {
    id: 251,
    label: 'Butterflies',
    value: 'butterflies',
    prefix: <IonIcon src={butterflyIcon} className="size-8" />,
  },
  moths: {
    id: 260,
    label: 'Moths',
    value: 'moths',
    prefix: <IonIcon src={mothIcon} className="size-8" />,
  },
  bumblebees: {
    id: 261,
    label: 'Bumblebees',
    value: 'bumblebees',
    prefix: <IonIcon src={bumblebeeIcon} className="size-8" />,
  },
  dragonflies: {
    id: 265,
    label: 'Dragonflies',
    value: 'dragonflies',
    prefix: <IonIcon src={dragonflyIcon} className="size-8" />,
  },
};

export default speciesGroups;
