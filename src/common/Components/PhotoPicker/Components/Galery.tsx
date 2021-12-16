import React, { FC } from 'react';
import { Gallery } from '@apps';
import Occurrence from 'models/occurrence';
import Media from 'models/media';
import { Trans as T } from 'react-i18next';
import { IonLabel, IonButton, IonIcon } from '@ionic/react';
import mothIcon from 'common/images/moth.svg';
import { observer } from 'mobx-react';
import '../styles.scss';

type Props = {
  model: typeof Occurrence;
  showGallery: any;
  hideGallery: () => boolean;
};

const getFooterMessage = (image: typeof Media, identifyImage: any) => {
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
      <IonLabel className="gallery-warning-message">
        <T>
          <b>Warning</b> - we could not identify this species.
        </T>
      </IonLabel>
    );
  }

  if (!doesTaxonMatchParent) {
    const { taxon } = image.attrs.species[0];
    const probability = (image.attrs.species[0].probability * 100).toFixed(0);

    return (
      <IonLabel className="gallery-warning-message">
        <T>
          <b>Warning</b> - we think it is
        </T>{' '}
        {probability}% <T>likely a</T> <i>{taxon}</i> <T>species</T>.
      </IonLabel>
    );
  }

  return null;
};

const GalleryComponent: FC<Props> = ({ model, showGallery, hideGallery }) => {
  const { media } = model;

  const getItem = (image: typeof Media) => {
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
