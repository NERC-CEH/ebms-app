import { FC } from 'react';
import { IonItem, IonLabel, IonIcon, IonAvatar } from '@ionic/react';
import speciesProfiles, {
  Species as SpeciesProfile,
} from 'common/data/profiles';
import butterflyIcon from 'common/images/butterfly.svg';
import './styles.scss';

interface Props {
  species: any;
}

const SpeciesEntry: FC<Props> = ({ species }) => {
  const scientificName = species.key;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const commonName = t(scientificName, null, true);

  let avatar = <IonIcon icon={butterflyIcon} />;

  const byName = (sp: SpeciesProfile) => sp.taxon === scientificName;
  const image = speciesProfiles.find(byName)?.image;
  if (image) {
    avatar = <img src={`/images/${image}_image.jpg`} />;
  }

  return (
    <IonItem className="species-entry">
      <IonAvatar>{avatar}</IonAvatar>

      <IonLabel position="stacked" mode="ios" color="dark">
        {commonName && (
          <IonLabel className="report-common-name-label">
            <b style={{ fontSize: '1.1em' }}>{commonName}</b>
          </IonLabel>
        )}

        <IonLabel class="ion-text-wrap report-taxon-label" position="stacked">
          <i>{scientificName}</i>
        </IonLabel>
      </IonLabel>

      <IonLabel slot="end" class="report-count-label">
        {species.doc_count}
      </IonLabel>
    </IonItem>
  );
};

export default SpeciesEntry;
