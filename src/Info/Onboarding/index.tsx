import { useState } from 'react';
import { observer } from 'mobx-react';
import { arrowForward, checkmarkOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Button, Main, Page } from '@flumens';
import { IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react';
import '@ionic/react/css/ionic-swiper.css';
import appModel from 'models/app';
import './styles.scss';

const Onboarding = ({ children }: any) => {
  const [moreSlidesExist, setMoreSlidesExist] = useState(true);
  const [controlledSwiper, setControlledSwiper] = useState<SwiperCore>();

  const handleSlideChangeStart = async () => {
    const isEnd = controlledSwiper && controlledSwiper.isEnd;
    setMoreSlidesExist(!isEnd);
  };

  const { showedWelcome } = appModel.data;

  if (showedWelcome) return children;

  function exit() {
    console.log('Info:Welcome:Controller: exit.');
    appModel.data.showedWelcome = true;
    appModel.save();
  }

  const slideNextOrClose = () => {
    if (moreSlidesExist) {
      controlledSwiper && controlledSwiper.slideNext();
      return;
    }

    exit();
  };

  return (
    <Page id="welcome-page">
      <Main>
        <Swiper
          id="welcome"
          onSwiper={setControlledSwiper}
          modules={[Pagination]}
          pagination={moreSlidesExist}
          onSlideChange={handleSlideChangeStart}
        >
          <SwiperSlide className="first">
            <div className="message">
              <p>
                <T>
                  Butterflies are captivating insects, but they are in decline
                  in many parts of Europe. As shown by this graph of The
                  Grassland Butterfly Indicator for the EU.
                </T>
              </p>
            </div>
          </SwiperSlide>

          <SwiperSlide className="second">
            <div className="message">
              <p>
                <T>
                  Data collected by this app can greatly improve knowledge of
                  the status of butterflies and their habitats.
                </T>
              </p>
            </div>
          </SwiperSlide>

          <SwiperSlide className="third">
            <div className="message">
              <p>
                <T>
                  We lack information on butterfly numbers in many parts of
                  Europe, as shown by the density of records currently available
                  to assess butterfly status.
                </T>
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="fourth">
            <div className="message">
              <p>
                <T>
                  It has never been easier to contribute high quality data for
                  research to support conservation of these fascinating and
                  vital insects. You can get started straight away
                </T>
              </p>
            </div>
          </SwiperSlide>
        </Swiper>
      </Main>

      <IonFooter className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="end">
            <Button
              className="mb-3 mr-2 size-12 rounded-full p-0"
              color="secondary"
              onPress={slideNextOrClose}
            >
              <IonIcon
                icon={!moreSlidesExist ? checkmarkOutline : arrowForward}
                className="size-6"
              />
            </Button>
          </IonButtons>
        </IonToolbar>
      </IonFooter>
    </Page>
  );
};

export default observer(Onboarding);
