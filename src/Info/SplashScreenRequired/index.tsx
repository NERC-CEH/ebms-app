import { useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IonButton } from '@ionic/react';
import '@ionic/react/css/ionic-swiper.css';
import appModel from 'models/app';
import './styles.scss';

const SplashScreenRequired = ({ children }: any) => {
  const [moreSlidesExist, setMoreSlidesExist] = useState(true);
  const [controlledSwiper, setControlledSwiper] = useState<SwiperCore>();

  const handleSlideChangeStart = async () => {
    const isEnd = controlledSwiper && controlledSwiper.isEnd;
    setMoreSlidesExist(!isEnd);
  };

  const slideNext = () => controlledSwiper && controlledSwiper.slideNext();

  const { showedWelcome } = appModel.attrs;

  if (showedWelcome) return children;

  function exit() {
    console.log('Info:Welcome:Controller: exit.');
    appModel.attrs.showedWelcome = true;
    appModel.save();
  }

  return (
    <Swiper
      id="welcome"
      onSwiper={setControlledSwiper}
      modules={[Pagination]}
      pagination={moreSlidesExist}
      onSlideChange={handleSlideChangeStart}
    >
      <SwiperSlide className="first">
        <IonButton className="skip" color="primary" strong onClick={exit}>
          <T>Skip</T>
        </IonButton>
        <IonButton
          className="next"
          fill="outline"
          color="primary"
          strong
          onClick={slideNext}
        >
          <T>Next</T>
        </IonButton>
        <div className="message">
          <p>
            <T>
              Butterflies are captivating insects, but they are in decline in
              many parts of Europe. As shown by this graph of The Grassland
              Butterfly Indicator for the EU.
            </T>
          </p>
        </div>
      </SwiperSlide>

      <SwiperSlide className="second">
        <IonButton className="skip" color="light" strong onClick={exit}>
          <T>Skip</T>
        </IonButton>
        <IonButton className="next" color="light" strong onClick={slideNext}>
          <T>Next</T>
        </IonButton>

        <div className="message">
          <p>
            <T>
              Data collected by this app can greatly improve knowledge of the
              status of butterflies and their habitats.
            </T>
          </p>
        </div>
      </SwiperSlide>

      <SwiperSlide className="third">
        <IonButton
          className="skip"
          fill="outline"
          color="primary"
          strong
          onClick={exit}
        >
          <T>Skip</T>
        </IonButton>
        <IonButton
          className="next"
          fill="outline"
          color="primary"
          strong
          onClick={slideNext}
        >
          <T>Next</T>
        </IonButton>
        <div className="message">
          <p>
            <T>
              We lack information on butterfly numbers in many parts of Europe,
              as shown by the density of records currently available to assess
              butterfly status.
            </T>
          </p>
        </div>
      </SwiperSlide>
      <SwiperSlide className="fourth">
        <div className="message">
          <p>
            <T>
              It has never been easier to contribute high quality data for
              research to support conservation of these fascinating and vital
              insects. You can get started straight away
            </T>
          </p>
        </div>
        <IonButton color="primary" strong onClick={exit}>
          <T>Get Started</T>
        </IonButton>
      </SwiperSlide>
    </Swiper>
  );
};

export default observer(SplashScreenRequired);
