/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Main, useOnBackButton, ImageWithBackground, Badge } from '@flumens';
import {
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonCardTitle,
} from '@ionic/react';
import '@ionic/react/css/ionic-swiper.css';
import { CountryCode } from 'common/config/countries';
import { Species, AbundanceCode, abundances } from 'common/data/profiles';
import FullScreenPhotoViewer from './FullScreenPhotoViewer';
import './styles.scss';

type Props = {
  species: Species;
  country: Exclude<CountryCode, 'UK' | 'ELSEWHERE'>;
  hideSpeciesModal: any;
};

const SpeciesProfile = ({ species, country, hideSpeciesModal }: Props) => {
  const [showGallery, setGallery] = useState(false);

  const closeGallery = () => setGallery(false);

  const openGallery = () => setGallery(true);

  useOnBackButton(hideSpeciesModal);

  const abundanceCode: AbundanceCode = species.abundance[country]!;
  const status = abundances[abundanceCode];

  const getSlides = () => {
    const { image_copyright } = species;
    if (!image_copyright) return null;

    const slideOpts = {
      initialSlide: 0,
      speed: 400,
    };

    const getSlide = (copyright: string, index: number) => {
      if (!copyright) return null;

      const imageURL = `/images/${species.id}_${index}_image.jpg`;

      return (
        <SwiperSlide
          key={imageURL}
          onClick={openGallery}
          className="species-profile-photo"
        >
          <ImageWithBackground src={imageURL} />
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
          <IonCardTitle>
            {(window as any).t(species.taxon, null, true)}
          </IonCardTitle>
          <IonCardSubtitle>
            <i>{species.taxon}</i>
          </IonCardSubtitle>
        </IonCardHeader>

        {status && (
          <IonCardContent>
            <h3 className="species-label inline-label">
              <T>Status</T>:
            </h3>
            <Badge>{status}</Badge>
          </IonCardContent>
        )}

        <IonCardContent className="description">
          <h3 className="species-label">
            <T>Description</T>:
          </h3>

          {(window as any).t(species.descriptionKey, true)}
        </IonCardContent>
      </Main>
    </>
  );
};
/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

export default SpeciesProfile;
