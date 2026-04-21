/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { observer } from 'mobx-react';
import { alertCircleOutline } from 'ionicons/icons';
import { IonIcon, IonSpinner } from '@ionic/react';
import Media from 'models/media';
import ProbabilityBadge from '../ProbabilityBadge';

type Props = { media: Media };

const ClassificationStatus = ({ media }: Props) => {
  if (media.isIdentifying)
    return (
      <IonSpinner
        slot="end"
        className="m-0.5 block size-5 rounded-full bg-black/65 text-white"
      />
    );

  if (!media.doesTaxonMatchParent()) {
    return (
      <IonIcon
        className="m-0.5 block size-[21px] rounded-full bg-white text-[var(--classifier-unlikely)]"
        icon={alertCircleOutline}
      />
    );
  }

  const { probability } = media.data.species?.[0] || {};
  if (probability)
    return <ProbabilityBadge probability={probability} className="" />;

  return null;
};

export default observer(ClassificationStatus);
