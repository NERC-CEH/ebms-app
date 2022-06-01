import { createRef } from 'react';
import { observer } from 'mobx-react';
import { IonSlides, IonSlide, IonButton } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import appModel from 'models/app';
import './styles.scss';

function next(sliderRef) {
  sliderRef.current.slideNext();
}

const SplashScreen = () => {
  function exit() {
    console.log('Info:Welcome:Controller: exit.');
    appModel.attrs.showedWelcome = true;
    appModel.save();
  }

  const sliderRef = createRef();

  const nextSlide = () => next(sliderRef);

  return (
    <IonSlides id="welcome" pager="true" ref={sliderRef}>
      <IonSlide class="first">
        <IonButton class="skip" color="primary" strong="true" onClick={exit}>
          <T>Skip</T>
        </IonButton>
        <IonButton
          class="next"
          fill="outline"
          color="primary"
          strong="true"
          onClick={nextSlide}
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
      </IonSlide>

      <IonSlide class="second">
        <IonButton class="skip" color="light" strong="true" onClick={exit}>
          <T>Skip</T>
        </IonButton>
        <IonButton class="next" color="light" strong="true" onClick={nextSlide}>
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
      </IonSlide>

      <IonSlide class="third">
        <IonButton
          class="skip"
          fill="outline"
          color="primary"
          strong="true"
          onClick={exit}
        >
          <T>Skip</T>
        </IonButton>
        <IonButton
          class="next"
          fill="outline"
          color="primary"
          strong="true"
          onClick={nextSlide}
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
      </IonSlide>
      <IonSlide class="fourth">
        <div className="message">
          <p>
            <T>
              It has never been easier to contribute high quality data for
              research to support conservation of these fascinating and vital
              insects. You can get started straight away
            </T>
          </p>
        </div>
        <IonButton color="primary" strong="true" onClick={exit}>
          <T>Get Started</T>
        </IonButton>
      </IonSlide>
    </IonSlides>
  );
};

SplashScreen.propTypes = {};

const Component = props => {
  const { showedWelcome } = appModel.attrs;

  if (!showedWelcome) {
    return <SplashScreen appModel={appModel} />;
  }

  return props.children;
};

Component.propTypes = {};

export default observer(Component);
