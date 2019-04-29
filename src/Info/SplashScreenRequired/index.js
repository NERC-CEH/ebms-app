import React from 'react';
import { observer } from 'mobx-react';
import Log from 'helpers/log';
import appModel from 'app_model';
import './styles.scss';
import './images/welcome_1.jpg';
import './images/welcome_2.jpg';
import './images/welcome_3.jpg';

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
    <ion-slides id="welcome" pager="true" ref={sliderRef}>
      <ion-slide class="first">
        <ion-button
          class="skip"
          fill="outline"
          color="light"
          strong="true"
          onClick={exit}
        >
          {t('Skip')}
        </ion-button>
        <ion-button
          class="next"
          fill="outline"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </ion-button>
        <div className="message">
          <h2>{t('Welcome')}</h2>
          <p>TODO: Add some text</p>
        </div>
      </ion-slide>

      <ion-slide class="second">
        <ion-button
          class="skip"
          fill="outline"
          color="light"
          strong="true"
          onClick={exit}
        >
          {t('Skip')}
        </ion-button>
        <ion-button
          class="next"
          fill="outline"
          color="light"
          strong="true"
          onClick={() => next(sliderRef)}
        >
          {t('Next')}
        </ion-button>

        <div className="message">
          <h2>Welcome</h2>
          <p>TODO: Add some text</p>
        </div>
      </ion-slide>

      <ion-slide class="third">
        <div className="message">
          <h2>{t('Lets start!')}</h2>
          <p>TODO: Add some text</p>
        </div>
        <ion-button color="light" strong="true" onClick={exit}>
          {' '}
          {t('Get Started')}
          {' '}
        </ion-button>
      </ion-slide>
    </ion-slides>
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
