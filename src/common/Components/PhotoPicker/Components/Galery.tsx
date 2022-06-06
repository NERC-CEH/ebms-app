import { FC } from 'react';
import { Gallery, useToast } from '@flumens';
import Occurrence from 'models/occurrence';
import userModel from 'models/user';
import Media from 'models/media';
import { Trans as T } from 'react-i18next';
import { IonLabel, IonButton, IonIcon } from '@ionic/react';
import mothIcon from 'common/images/moth.svg';
import { observer } from 'mobx-react';
import '../styles.scss';

type Props = {
  model: Occurrence;
  showGallery: any;
  hideGallery: () => boolean;
};

const getFooterMessage = (image: Media, identifyImage: any) => {
  const doesTaxonMatchParent = image.doesTaxonMatchParent();
  const identifierWasNotUsed = !image.attrs.species;
  const identifierFoundNoSpecies = !image.attrs?.species?.length;

  if (identifierWasNotUsed) {
    return (
      <IonButton
        className="re-identify-button"
        fill="clear"
        size="small"
        onClick={identifyImage}
      >
        <IonIcon icon={mothIcon} />
        <T>Identify</T>
      </IonButton>
    );
  }

  if (identifierFoundNoSpecies) {
    return (
      <IonLabel className="gallery-ai-message">
        <T>
          <b>Warning</b> - we could not identify this species.
        </T>
      </IonLabel>
    );
  }

  const { taxon, probability: prob } = image.attrs.species[0];
  const probability = ((prob || 0) * 100).toFixed(0);

  if (!doesTaxonMatchParent) {
    return (
      <IonLabel className="gallery-ai-message">
        <T>
          <b>Warning</b> - we think it is {{ probability }}% likely a{' '}
          <i>{{ taxon }}</i> species
        </T>
        .
      </IonLabel>
    );
  }

  return (
    <IonLabel className="gallery-warning-message">
      <T>
        We think it is {{ probability }}% likely a <i>{{ taxon }}</i> species
      </T>
      .
    </IonLabel>
  );
};

const GalleryComponent: FC<Props> = ({ model, showGallery, hideGallery }) => {
  const { media } = model;
  const toast = useToast();

  const getItem = (image: Media) => {
    const identifyImage = async () => {
      if (!userModel.isLoggedIn()) {
        toast.warn('User is not logged in.');
        return;
      }
      hideGallery();
      await image.identify();
    };

    return {
      src: image.getURL(),
      footer: getFooterMessage(image, identifyImage),
    };
  };
  const items = media.map(getItem);

  return (
    <Gallery
      isOpen={!!showGallery}
      items={items}
      initialSlide={showGallery - 1}
      onClose={hideGallery}
    />
  );
};

export default observer(GalleryComponent);
