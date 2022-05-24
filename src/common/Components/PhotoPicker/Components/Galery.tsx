import { FC } from 'react';
import { Gallery } from '@flumens';
import Occurrence from 'models/occurrence';
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
        <T>IDENTIFY</T>
      </IonButton>
    );
  }

  if (identifierFoundNoSpecies) {
    return (
      <IonLabel className="gallery-warning-message">
        <T>
          <b>Warning</b> - we could not identify this species.
        </T>
      </IonLabel>
    );
  }

  const { taxon } = image.attrs.species[0];
  const probability = (image.attrs.species[0]?.probability * 100).toFixed(0);

  if (!doesTaxonMatchParent) {
    return (
      <IonLabel className="gallery-warning-message">
        <T>
          <b>Warning</b> - we think it is
        </T>{' '}
        {probability}% <T>likely a</T> <i>{taxon}</i> <T>species</T>.
      </IonLabel>
    );
  }

  return (
    <IonLabel className="gallery-warning-message">
      <T>We think it is</T> {probability}% <T>likely a</T> <i>{taxon}</i>{' '}
      <T>species</T>.
    </IonLabel>
  );
};

const GalleryComponent: FC<Props> = ({ model, showGallery, hideGallery }) => {
  const { media } = model;

  const getItem = (image: Media) => {
    const identifyImage = async () => {
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
