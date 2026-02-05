import { IonItem } from '@ionic/react';
import {
  getSpeciesProfileByName,
  getSpeciesProfileImage,
} from 'common/data/profiles';
import { Species } from '../services';

type Props = {
  species: Species;
};

const SpeciesEntry = ({ species }: Props) => {
  const profile = getSpeciesProfileByName(species.scientificName);

  return (
    <IonItem className="[--inner-padding-end:0] [--padding-start:0]">
      <div className="flex w-full flex-nowrap items-center gap-2 py-1.5 pl-2 pr-4">
        <div className="list-avatar">{getSpeciesProfileImage(species)}</div>

        <div className="flex w-full flex-col justify-center">
          {profile?.commonName && (
            <div className="font-medium">{profile?.commonName}</div>
          )}
          <div className="text-base italic opacity-70">
            {species.scientificName}
          </div>
        </div>

        <div className="max-w:[50px] text-lg font-medium">{species.count}</div>
      </div>
    </IonItem>
  );
};

export default SpeciesEntry;
