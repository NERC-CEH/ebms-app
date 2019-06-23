import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { IonContent, IonIcon } from '@ionic/react';

const Component = observer(({ isLoggedIn, user, logOut }) => {
  return (
    <IonContent>
      <ion-list lines="full">
        {isLoggedIn && (
          <ion-item detail id="logout-button" onClick={logOut}>
            <IonIcon name="exit" size="small" slot="start" />
            {t('Logout')}
            {': '}
            {user.firstname} 
            {' '}
            {user.secondname}
          </ion-item>
        )}

        {!isLoggedIn && (
          <ion-item href="#user/login" detail>
            <IonIcon name="person" size="small" slot="start" />
            {t('Login')}
          </ion-item>
        )}

        {!isLoggedIn && (
          <ion-item href="#user/register" detail>
            <IonIcon name="person-add" size="small" slot="start" />
            {t('Register')}
          </ion-item>
        )}

        <ion-item-divider>{t('Settings')}</ion-item-divider>
        <ion-item href="#settings" detail>
          <IonIcon name="settings" size="small" slot="start" />
          {t('App')}
        </ion-item>
        <ion-item-divider>{t('Info')}</ion-item-divider>
        <ion-item href="https://butterfly-monitoring.net/privacy-notice" detail>
          <IonIcon name="lock" size="small" slot="start" />
          {t('Privacy Policy')}
        </ion-item>
        <ion-item href="#info/credits" detail>
          <IonIcon name="heart" size="small" slot="start" />
          {t('Credits')}
        </ion-item>
      </ion-list>
    </IonContent>
  );
});

Component.propTypes = {
  logOut: PropTypes.func,
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default Component;
