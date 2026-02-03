import { IonItem, IonIcon } from '@ionic/react';
import speciesProfiles, {
  Species as SpeciesProfile,
} from 'common/data/profiles';
import butterflyIcon from 'common/images/butterfly.svg';
import { speciesGroupIcons } from 'models/occurrence';
import { Species } from '../services';

type Props = {
  species: Species;
};

const SpeciesEntry = ({ species }: Props) => {
  const { scientificName, count, groupId: speciesGroupId } = species;

  const byName = (sp: SpeciesProfile) => sp.taxon === scientificName;
  const profile = speciesProfiles.find(byName);

  let avatar: any;
  const hasImage = profile?.imageCopyright?.length;
  if (hasImage) {
    avatar = (
      <img
        src={`/images/${profile.id}_0_image.jpg`}
        className="h-full w-full object-cover"
      />
    );
  } else {
    avatar = (
      <IonIcon
        icon={
          speciesGroupId
            ? (speciesGroupIcons as any)[speciesGroupId]
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
          {profile?.commonName && (
            <div className="font-medium">{profile?.commonName}</div>
          )}
          <div className="text-base italic opacity-70">{scientificName}</div>
        </div>

        <div className="max-w:[50px] text-lg font-medium">{count}</div>
      </div>
    </IonItem>
  );
};

export default SpeciesEntry;
