/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Main, useOnBackButton, ImageWithBackground, Badge } from '@flumens';
import '@ionic/react/css/ionic-swiper.css';
import { CountryCode } from 'common/config/countries';
import { Species, AbundanceCode, abundances } from 'common/data/profiles';
import { translateSpeciesDescription } from 'common/translations/translator';
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

  const { commonName } = species;

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

        <div className="flex flex-col gap-2 bg-[var(--ion-page-background)] p-4">
          {commonName && (
            <h2 className="text-xl font-bold text-primary-900">{commonName}</h2>
          )}
          <h3 className="text-xl italic">{species.taxon}</h3>
        </div>

        <div className="p-4">
          {status && (
            <div>
              <h3 className="species-label mr-3 inline">
                <T>Status</T>:
              </h3>
              <Badge>{status}</Badge>
            </div>
          )}

          <h3 className="species-label mb-2 mt-5">
            <T>Description</T>:
          </h3>

          <p>{translateSpeciesDescription(species.descriptionKey)}</p>
        </div>
      </Main>
    </>
  );
};
/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

export default SpeciesProfile;
