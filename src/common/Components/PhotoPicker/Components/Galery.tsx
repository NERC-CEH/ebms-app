import React, { FC } from 'react';
import { Gallery } from '@apps';
import Occurrence from 'models/occurrence';
import Media from 'models/media';
import { Trans as T } from 'react-i18next';
import { IonLabel } from '@ionic/react';
import { observer } from 'mobx-react';
import '../styles.scss';

type Props = {
  model: typeof Occurrence;
  showGallery: any;
  hideGallery: () => boolean;
};

const GalleryComponent: FC<Props> = ({ model, showGallery, hideGallery }) => {
  const { media } = model;

  const getItem = (image: typeof Media) => {
    let message;
    const doesTaxonMatchParent = image.doesTaxonMatchParent();

    if (!doesTaxonMatchParent) {
      const { taxon } = image.attrs.species[0];
      const probability = (image.attrs.species[0].probability * 100).toFixed(0);

      message = (
        <IonLabel className="gallery-warning-message">
          <T>
            <b>Warning</b> - we think it is
          </T>{' '}
          {probability}% <T>likely a</T> <i>{taxon}</i> <T>species</T>.
        </IonLabel>
      );
    }
    if (typeof doesTaxonMatchParent === 'string') {
      message = (
        <IonLabel className="gallery-warning-message">
          <T>
            <b>Warning</b> - we could not identify this species.
          </T>
        </IonLabel>
      );
    }

    return {
      src: image.getURL(),
      footer: message,
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
