import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Gallery, useToast } from '@flumens';
import { IonLabel, IonButton, IonIcon } from '@ionic/react';
import mothIcon from 'common/images/moth.svg';
import Media from 'models/media';
import userModel from 'models/user';
import '../styles.scss';

type Props = {
  items: Media[];
  showGallery: number;
  onClose: () => boolean;
};

const getFooterMessage = (image: Media, identifyImage: any) => {
  const doesTaxonMatchParent = image.doesTaxonMatchParent();
  const identifierWasNotUsed = !image.attrs.species;
  const identifierFoundNoSpecies = !image.attrs?.species?.length;

  const showLoading = image.identification.identifying;
  if (showLoading) return null;

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
          <b>Warning</b> - we think it is {{ probability } as any}% likely a{' '}
          <i>{{ taxon } as any}</i> species
        </T>
        .
      </IonLabel>
    );
  }

  return (
    <IonLabel className="gallery-ai-message">
      <T>
        We think it is {{ probability } as any}% likely a{' '}
        <i>{{ taxon } as any}</i> species
      </T>
      .
    </IonLabel>
  );
};

const GalleryComponent: FC<Props> = ({ items, showGallery, onClose }) => {
  const toast = useToast();

  const getItem = (image: Media) => {
    const identifyImage = async () => {
      if (!userModel.isLoggedIn()) {
        toast.warn('User is not logged in.');
        return;
      }
      onClose();
      await image.identify();
    };

    return {
      src: image.getURL(),
      footer: getFooterMessage(image, identifyImage),
    };
  };

  return (
    <Gallery
      isOpen={Number.isFinite(showGallery)}
      items={items.map(getItem)}
      initialSlide={showGallery}
      onClose={onClose}
    />
  );
};

export default observer(GalleryComponent);
