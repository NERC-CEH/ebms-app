/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
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
import { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import '@ionic/react/css/ionic-swiper.css';
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

  const getSlides = () => {
    const { image_copyright } = species;

    const slideOpts = {
      initialSlide: 0,
      speed: 400,
    };

    const getSlide = (copyright, index) => {
      if (!copyright) return null;

      return (
        <SwiperSlide
          // key={imageURL}
          // onClick={showPhotoInFullScreenWrap}
          className="species-profile-photo"
        >
          <img
            src={`/images/${species.id}_${index}_image.jpg`}
            alt="species"
            onClick={openGallery}
          />
        </SwiperSlide>
      );
    };

    const slideImage = image_copyright.map(getSlide);

    return (
      <Swiper modules={[Pagination]} pagination {...slideOpts}>
        {slideImage}
      </Swiper>
    );
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
  return (
    <>
      <FullScreenPhotoViewer
        species={species}
        onClose={closeGallery}
        showGallery={showGallery}
      />

      <Main id="species-profile" className="ion-padding">
        {getSlides()}

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
