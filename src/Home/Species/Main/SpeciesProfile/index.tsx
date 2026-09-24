import { useState } from 'react';
import { Trans as T, useTranslation } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Main, useOnBackButton, ImageWithBackground, Badge } from '@flumens';
import '@ionic/react/css/ionic-swiper.css';
import { CountryCode } from 'common/config/countries';
import { Species, AbundanceCode, abundances } from 'common/data/profiles';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import FullScreenPhotoViewer from './FullScreenPhotoViewer';
import './styles.scss';

type Props = {
  species: Species;
  country: Exclude<CountryCode, 'UK' | 'ELSEWHERE'>;
  hideSpeciesModal: () => void;
};

const SpeciesProfile = ({ species, country, hideSpeciesModal }: Props) => {
  const { t } = useTranslation();
  const [gallery, setGallery] = useState(false);

  const closeGallery = () => setGallery(false);

  const openGallery = () => setGallery(true);

  useOnBackButton(hideSpeciesModal);

  const abundanceCode: AbundanceCode = species.abundance[country]!;
  const status = abundances[abundanceCode];

  const getSlides = () => {
    if (!species.imageCopyright) return null;

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

    const slideImage = species.imageCopyright.map(getSlide);

    return (
      <Swiper modules={[Pagination]} pagination {...slideOpts}>
        {slideImage}
      </Swiper>
    );
  };

  const { commonName, descriptionKey } = species;
  const description = descriptionKey
    ? t(descriptionKey as never, { ns: 'species' as never })
    : null;

  return (
    <>
      <FullScreenPhotoViewer
        species={species}
        onClose={closeGallery}
        showGallery={gallery}
      />

      <Main id="species-profile" className="ion-padding">
        {getSlides()}

        <div className="flex flex-col gap-2 bg-[var(--ion-page-background)] p-4">
          <TaxonPrettyName
            className="text-xl"
            scientificName={species.taxon}
            commonName={commonName}
          />
        </div>

        <div className="p-4">
          {status && (
            <div>
              <h3 className="species-label mr-3 inline">
                <T>common.status</T>:
              </h3>
              <Badge>{status}</Badge>
            </div>
          )}

          <h3 className="species-label mt-5!">
            <T>common.description</T>:
          </h3>

          <p>
            {description !== descriptionKey && descriptionKey ? (
              <T
                i18nKey={descriptionKey as never}
                ns={'species' as never}
                components={{ i: <i />, I: <i /> }}
              />
            ) : null}
          </p>
        </div>
      </Main>
    </>
  );
};

export default SpeciesProfile;
