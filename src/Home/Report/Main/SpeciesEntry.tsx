import { useTranslation } from 'react-i18next';
import { IonItem, IonIcon } from '@ionic/react';
import speciesProfiles, {
  Species as SpeciesProfile,
} from 'common/data/profiles';
import butterflyIcon from 'common/images/butterfly.svg';
import { speciesListGroupImages } from 'models/occurrence';

interface Props {
  species: any;
}

const SpeciesEntry = ({ species }: Props) => {
  const { t } = useTranslation();

  const scientificName = species.key;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const commonName = t(scientificName, null, true);

  const speciesGroupId = species?.group_id?.value;

  const byName = (sp: SpeciesProfile) => sp.taxon === scientificName;
  const image = speciesProfiles.find(byName);

  let avatar: any;
  const hasImage = image?.image_copyright?.length;
  if (hasImage) {
    avatar = (
      <img
        src={`/images/${image.id}_0_image.jpg`}
        className="h-full w-full object-cover"
      />
    );
  } else {
    avatar = (
      <IonIcon
        icon={
          speciesGroupId
            ? (speciesListGroupImages as any)[speciesGroupId]
            : butterflyIcon
        }
        className="size-8 opacity-75"
      />
    );
  }

  return (
    <IonItem className="[--inner-padding-end:0] [--padding-start:0]">
      <div className="flex w-full flex-nowrap items-center gap-2 py-1.5 pl-2 pr-4">
        <div className="list-avatar">{avatar}</div>
        {/* <IonAvatar className="[--border-radius:5px]">{avatar}</IonAvatar> */}

        <div className="flex w-full flex-col justify-center">
          {commonName && <div className="">{commonName}</div>}
          <div className="text-base italic opacity-70">{scientificName}</div>
        </div>

        <div className="max-w:[50px] text-lg">{species.doc_count}</div>
      </div>
    </IonItem>
  );
};

export default SpeciesEntry;
