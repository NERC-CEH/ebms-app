/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

import { useState } from 'react';
import {
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonCardTitle,
  IonChip,
} from '@ionic/react';
import { Main, useOnBackButton } from '@flumens';
import { Trans as T } from 'react-i18next';
import FullScreenPhotoViewer from './FullScreenPhotoViewer';
import './styles.scss';

const statuses = {
  A: 'Absent',
  P: 'Present',
  'P?': 'Possibly present',
  M: 'Regular migrant',
  I: 'Irregular vagrant',
  Ex: 'Regionally extinct',
};

const SpeciesProfile = ({ species, country, hideSpeciesModal }) => {
  const [showGallery, setGallery] = useState(false);

  const closeGallery = () => setGallery(false);

  const openGallery = () => setGallery(true);

  useOnBackButton(hideSpeciesModal);

  const status = statuses[species.abundance[country]];

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
  return (
    <>
      <FullScreenPhotoViewer
        species={species}
        onClose={closeGallery}
        showGallery={showGallery}
      />

      <Main id="species-profile" className="ion-padding">
        <img
          src={`/images/${species.image}_image.jpg`}
          alt="species"
          onClick={openGallery}
        />

        <IonCardHeader>
          <IonCardTitle>{t(species.taxon, null, true)}</IonCardTitle>
          <IonCardSubtitle>
            <i>{species.taxon}</i>
          </IonCardSubtitle>
        </IonCardHeader>

        {status && (
          <IonCardContent>
            <h3 className="species-label inline-label">
              <T>Status</T>:
            </h3>
            <span>
              <IonChip className="species-status" outline>
                <T>{status}</T>
              </IonChip>
            </span>
          </IonCardContent>
        )}

        <IonCardContent>
          <h3 className="species-label">
            <T>Description</T>:
          </h3>

          {t(species.descriptionKey, true)}
        </IonCardContent>
      </Main>
    </>
  );
};
/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

export default SpeciesProfile;
