/* eslint-disable jsx-a11y/control-has-associated-label */
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
import graph from './images/welcome_1.png';
import guidelines from './images/welcome_3.jpg';
import './styles.scss';

const Onboarding = ({ children }: any) => {
  const [moreSlidesExist, setMoreSlidesExist] = useState(true);
  const [controlledSwiper, setControlledSwiper] = useState<SwiperCore>();

  const handleSlideChangeStart = async () => {
    const isEnd = controlledSwiper?.isEnd;
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
      controlledSwiper?.slideNext();
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
            <div className="absolute left-0 top-0 z-[10000] mt-2 w-full p-2.5 pt-[calc(var(--ion-safe-area-top,0)_+_10px)] text-center text-4xl">
              <span className="mr-2 font-bold text-primary">Butterfly</span>
              Count
            </div>
            <div className="absolute inset-0 top-[15vh] flex flex-col items-center justify-center bg-[linear-gradient(to_right,#e8e8e8,transparent_1px),linear-gradient(to_bottom,#e8e8e8,transparent_1px)] bg-[size:24px_24px] bg-[position:-1px_-1px]">
              <div className="w-2/3 rounded-md border border-solid border-primary-200 bg-white/70 px-6 py-3 text-left text-lg text-primary-900 backdrop-blur-sm backdrop-filter">
                <T>
                  Butterflies are captivating insects, but they are declining in
                  many parts of the world. For example, this graph shows the
                  European grassland butterfly index.
                </T>
              </div>
              <img src={graph} alt="pic" className="" />
            </div>
          </SwiperSlide>

          <SwiperSlide className="second">
            <div className="absolute bottom-[10vh] w-2/3 overflow-hidden rounded-md border border-solid border-primary-200 bg-white/70 px-6 py-3 text-lg text-primary-900 backdrop-blur-sm backdrop-filter">
              <T>
                Data collected by this app can greatly improve knowledge of the
                status of butterflies and their habitats.
              </T>
            </div>
          </SwiperSlide>

          <SwiperSlide className="third">
            <div className="absolute bottom-[10vh] flex h-full w-full flex-col items-center justify-center">
              <a href="https://www.geobon.org/downloads/biodiversity-monitoring/technical-reports/GEOBON/2015/Global-Butterfly-Monitoring-Web.pdf">
                <img src={guidelines} alt="" />
              </a>

              <div className="-mt-16 w-2/3 shrink-0 overflow-hidden rounded-md border border-solid border-primary-200 bg-white/70 px-6 py-3 text-lg text-primary-900 backdrop-blur-sm backdrop-filter">
                <T>
                  We lack structured information on butterfly numbers in many
                  parts of the world.
                </T>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className="fourth">
            <div className="absolute bottom-[7vh] w-2/3 overflow-hidden rounded-md border border-solid border-primary-200 bg-white/70 px-6 py-3 text-lg text-primary-900 backdrop-blur-sm backdrop-filter">
              <T>
                It has never been easier to contribute high quality data for
                research to support conservation of these fascinating and vital
                insects. You can get started straight away
              </T>
            </div>
          </SwiperSlide>
        </Swiper>
      </Main>

      <IonFooter className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="end">
            <Button
              className="mb-3 mr-2 size-12 rounded-full p-0 bg-secondary-600"
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
