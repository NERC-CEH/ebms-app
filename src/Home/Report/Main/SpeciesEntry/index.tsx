import { FC } from 'react';
import { IonItem, IonLabel, IonIcon, IonAvatar } from '@ionic/react';
import speciesProfiles, {
  Species as SpeciesProfile,
} from 'common/data/profiles';
import butterflyIcon from 'common/images/butterfly.svg';
import { speciesListGroupImages } from 'models/occurrence';
import './styles.scss';

interface Props {
  species: any;
}

const SpeciesEntry: FC<Props> = ({ species }) => {
  const scientificName = species.key;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const commonName = t(scientificName, null, true);

  const hasGroupId = species?.group_id?.value;
  let avatar = hasGroupId ? (
    <IonIcon icon={(speciesListGroupImages as any)[species?.group_id?.value]} />
  ) : (
    <IonIcon icon={butterflyIcon} />
  );

  const byName = (sp: SpeciesProfile) => sp.taxon === scientificName;
  const image = speciesProfiles.find(byName);

  const hasImage = image?.image_copyright?.length;
  if (hasImage) {
    avatar = <img src={`/images/${image.id}_0_image.jpg`} />;
  }

  return (
    <IonItem className="species-entry">
      <div className="flex w-full flex-nowrap items-center gap-2">
        <IonAvatar>{avatar}</IonAvatar>
        <div className="flex w-full flex-col justify-center">
          {commonName && (
            <div className="">
              <b style={{ fontSize: '1.1em' }}>{commonName}</b>
            </div>
          )}

          <div className="">
            <i>{scientificName}</i>
          </div>
        </div>

        <div className="max-w:[50px]">{species.doc_count}</div>
      </div>
    </IonItem>
  );
};

export default SpeciesEntry;
