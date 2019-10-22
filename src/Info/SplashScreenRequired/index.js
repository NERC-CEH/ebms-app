import React from 'react';
import { observer } from 'mobx-react';
import { IonSlides, IonSlide, IonButton } from '@ionic/react';
import Log from 'helpers/log';
import appModel from 'app_model';
import './styles.scss';
import './images/welcome_1.jpg';
import './images/welcome_2.jpg';
import './images/welcome_3.jpg';
import './images/welcome_4.jpg';

function next(sliderRef) {
  sliderRef.current.slideNext();
}

const SplashScreen = () => {
  function exit() {
    Log('Info:Welcome:Controller: exit.');
    appModel.set('showedWelcome', true);
    appModel.save();
  }

  const sliderRef = React.createRef();

  return (
    <IonSlides id="welcome" pager="true" ref={sliderRef}>
      <IonSlide class="first">
        <IonButton class="skip" color="primary" strong="true" onClick={exit}>
          {t('Skip')}
        </IonButton>
        <IonButton
          class="next"
          fill="outline"
          color="primary"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </IonButton>
        <div className="message">
          <p>
            {t(`Butterflies are captivating insects, but they are in decline in many parts of Europe. As shown by this graph of The Grassland Butterfly Indicator for the EU.`)}
          </p>
        </div>
      </IonSlide>

      <IonSlide class="second">
        <IonButton
          class="skip"
          color="light"
          strong="true"
          onClick={exit}
        >
          {t('Skip')}
        </IonButton>
        <IonButton
          class="next"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </IonButton>

        <div className="message">
          <p>
            {t(
              'Data collected by this app can greatly improve knowledge of the status of butterflies and their habitats.'
            )}
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
          {t('Skip')}
        </IonButton>
        <IonButton
          class="next"
          fill="outline"
          color="primary"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </IonButton>
        <div className="message">
          <p>
            {t(
              'We lack information on butterfly numbers in many parts of Europe, as shown by the density of records currently available to assess butterfly status.'
            )}
          </p>
        </div>
      </IonSlide>
      <IonSlide class="fourth">
        <div className="message">
          <p>
            {t(
              'It has never been easier to contribute high quality data for research to support conservation of these fascinating and vital insects.  You can get started straight away'
            )}
          </p>
        </div>
        <IonButton color="primary" strong="true" onClick={exit}>
          {t('Get Started')}
        </IonButton>
      </IonSlide>
    </IonSlides>
  );
};

SplashScreen.propTypes = {};

const Component = observer(props => {
  if (!appModel.get('showedWelcome')) {
    return <SplashScreen appModel={appModel} />;
  }

  return props.children;
});

Component.propTypes = {};

export default Component;
