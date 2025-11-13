import { JSX } from 'react';
import { IonIcon } from '@ionic/react';
import bumblebeeIcon from 'common/images/bumblebee.svg';
import butterflyIcon from 'common/images/butterfly.svg';
import dragonflyIcon from 'common/images/dragonfly.svg';
import mothIcon from 'common/images/moth.svg';

export type SpeciesGroup = {
  /**
   * Informal species group ID.
   */
  id: number;
  /**
   * Species list ID in warehouse.
   */
  listId: number;
  /**
   * Used as "smpAttr:1735" value.
   */
  attributeId: number;
  label: string;
  prefix: JSX.Element;
};

const speciesGroups = {
  butterflies: {
    id: 104,
    listId: 251,
    attributeId: 20648,
    label: 'Butterflies',
    prefix: <IonIcon src={butterflyIcon} className="size-8" />,
  },
  moths: {
    id: 114,
    listId: 260,
    attributeId: 20647,
    label: 'Moths',
    prefix: <IonIcon src={mothIcon} className="size-8" />,
  },
  bumblebees: {
    id: 110,
    listId: 261,
    attributeId: 20650,
    label: 'Bumblebees',
    prefix: <IonIcon src={bumblebeeIcon} className="size-8" />,
  },
  dragonflies: {
    id: 107,
    listId: 265,
    attributeId: 20649,
    label: 'Dragonflies',
    prefix: <IonIcon src={dragonflyIcon} className="size-8" />,
  },
} as const satisfies Record<string, SpeciesGroup>;

export default speciesGroups;
