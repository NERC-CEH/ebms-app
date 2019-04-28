import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { IonContent } from '@ionic/react';
import AppHeader from 'common/Components/Header';

const Component = observer(() => {
  return (
    <>
      <AppHeader title="Menu" />
      <IonContent>
        <ion-list lines="full">
          <ion-item-divider>{t('Info')}</ion-item-divider>
          <ion-item href="#info/about" detail>
            <span slot="start" className="icon icon-info" />
            {t('About')}
          </ion-item>
          <ion-item href="#info/help" detail>
            <span slot="start" className="icon icon-help" />
            {t('Help')}
          </ion-item>
          <ion-item href="#info/privacy" detail>
            <span slot="start" className="icon icon-lock-closed" />
            {t('Privacy Policy')}
          </ion-item>
          <ion-item href="#info/credits" detail>
            <span slot="start" className="icon icon-heart" />
            {t('Credits')}
          </ion-item>
        </ion-list>
      </IonContent>
    </>
  );
});

Component.propTypes = {
  logOut: PropTypes.func,
  user: PropTypes.object,
};

export default Component;
