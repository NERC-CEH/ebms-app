import { useState } from 'react';
import clsx from 'clsx';
import { closeCircle, checkmarkCircle, cameraOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Gallery, ElasticOccurrence, ImageWithBackground } from '@flumens';
import { IonCardHeader, IonCardContent, IonIcon } from '@ionic/react';
import '@ionic/react/css/ionic-swiper.css';
import config from 'common/config';
import getSurveyValueKey from 'Survey/common/translationKeys';
import MultiPageCustomAlert from './MultiPageCustomAlert';
import './styles.scss';

// https://stackoverflow.com/a/57447842
type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

type Media = ArrayElement<ElasticOccurrence['occurrence']['media']>;
type Props = {
  records: ElasticOccurrence[];
  onClose: () => void;
};

const statuses = {
  C: 'records.unconfirmed',
  R: 'records.rejected',
  V: 'records.accepted',
};

// Verification status 1: Accepted, Rejected or Unconfirmed
// Verification status 2: Correct, Considered correct, Unable to verify, Incorrect, Not reviewed, or Plausible

const Profile = (record: ElasticOccurrence) => {
  const [showGallery, setShowGallery] = useState<number>();

  const getSlides = (media?: Media[]) => {
    if (!media?.length)
      return (
        <div className="empty">
          <IonIcon icon={cameraOutline} />
        </div>
      );

    const slideOpts = {
      initialSlide: 0,
      speed: 400,
    };

    const getSlide = (image: Media, index: number) => {
      const { path } = image;
      const showPhotoInFullScreenWrap = () => setShowGallery(index);
      const imageURL = `${config.backend.mediaUrl}${path}`;

      return (
        <SwiperSlide
          key={imageURL}
          onClick={showPhotoInFullScreenWrap}
          className="species-profile-photo"
        >
          <ImageWithBackground src={imageURL} />
        </SwiperSlide>
      );
    };

    const slideImage = media?.map(getSlide);

    const pager = media.length > 1;

    return (
      <Swiper
        modules={[Pagination]}
        pagination={pager}
        className={clsx(pager && 'paginated')}
        {...slideOpts}
      >
        {slideImage}
      </Swiper>
    );
  };

  const getFullScreenPhotoViewer = () => {
    const initialSlide = showGallery;

    const getImageSource = ({ path }: Media) => {
      const imageURL = `${config.backend.mediaUrl}${path}`;

      return { src: imageURL };
    };

    const items = record.occurrence.media?.map(getImageSource) || [];

    const isOpen = Number.isFinite(showGallery);

    return (
      <Gallery
        isOpen={isOpen}
        items={items}
        initialSlide={initialSlide}
        onClose={setShowGallery}
        mode="md"
      />
    );
  };

  const date = record.metadata.created_on.split(' ')[0];
  const formattedDate = new Date(date).toLocaleString('en-GB').split(',')[0];

  const status = record.identification.verification_status;
  const statusText = statuses[status];

  const commonName = record.taxon.vernacular_name;
  const scientificName = record.taxon.accepted_name;

  const gridRef = record.location.output_sref;

  const count = record.occurrence.individual_count;
  const stage = record.occurrence.life_stage;

  let statusIcon;
  if (status) {
    if (status === 'V') {
      statusIcon = <IonIcon icon={checkmarkCircle} className="id-green" />;
    } else if (status === 'C') {
      statusIcon = <IonIcon icon={checkmarkCircle} className="id-amber" />;
    } else {
      statusIcon = <IonIcon icon={closeCircle} className="id-red" />;
    }
    statusIcon = <div className="verification-status">{statusIcon}</div>;
  }

  return (
    <SwiperSlide key={record.id}>
      <div className="alert-species-profile">
        <div className="gallery">{getSlides(record.occurrence.media)}</div>

        <IonCardHeader>
          {statusIcon}

          <div className="title">
            {commonName && <h1>{commonName}</h1>}
            <h3>
              <i>{scientificName}</i>
            </h3>
          </div>
        </IonCardHeader>

        <IonCardContent>
          <div className="record-attribute">
            <span>
              <T>common.status</T>:
            </span>{' '}
            <T i18nKey={statusText as never} />
          </div>
          <div className="record-attribute">
            <span>
              <T>common.date</T>:
            </span>{' '}
            {formattedDate}
          </div>
          <div className="record-attribute">
            <span>
              <T>common.location</T>:
            </span>{' '}
            {gridRef}
          </div>
          {count && (
            <div className="record-attribute">
              <span>
                <T>common.count</T>:
              </span>{' '}
              {count}
            </div>
          )}
          {stage && (
            <div className="record-attribute">
              <span>
                <T>common.stage</T>:
              </span>{' '}
              {getSurveyValueKey(stage) ? (
                <T i18nKey={getSurveyValueKey(stage) as never} />
              ) : (
                stage
              )}
            </div>
          )}
        </IonCardContent>

        {getFullScreenPhotoViewer()}
      </div>
    </SwiperSlide>
  );
};

export default function RecordProfiles({ records, onClose }: Props) {
  if (!records?.length) return null;

  return (
    <MultiPageCustomAlert onClose={onClose}>
      {records.map(Profile)}
    </MultiPageCustomAlert>
  );
}
