import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { IonIcon, IonList, IonItem, IonItemDivider } from '@ionic/react';
import {
  settingsOutline,
  exitOutline,
  personOutline,
  personAddOutline,
  lockClosedOutline,
  heartOutline,
  informationCircleOutline,
  helpBuoyOutline,
  bookOutline,
  openOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main } from '@apps';
import config from 'config';
import './styles.scss';
import './logo.png';

const Component = observer(({ isLoggedIn, user, logOut, appModel }) => {
  const lang = appModel.attrs.language;

  return (
    <Main class="app-menu">
      <img src="/images/logo.png" alt="app logo" />

      <IonList lines="full">
        <IonItemDivider>
          <T>User</T>
        </IonItemDivider>
        {isLoggedIn && (
          <IonItem detail id="logout-button" onClick={logOut}>
            <IonIcon icon={exitOutline} size="small" slot="start" />
            <T>Logout</T>
            {': '}
            {user.firstname} {user.secondname}
          </IonItem>
        )}

        {!isLoggedIn && (
          <IonItem routerLink="/user/login" detail>
            <IonIcon icon={personOutline} size="small" slot="start" />
            <T>Login</T>
          </IonItem>
        )}

        {!isLoggedIn && (
          <IonItem routerLink="/user/register" detail>
            <IonIcon icon={personAddOutline} size="small" slot="start" />
            <T>Register</T>
          </IonItem>
        )}

        <IonItemDivider>
          <T>Info</T>
        </IonItemDivider>
        <IonItem routerLink="/info/guide" detail>
          <IonIcon icon={bookOutline} size="small" slot="start" />
          <T>Guide</T>
        </IonItem>
        <IonItem routerLink="/info/help" detail>
          <IonIcon icon={helpBuoyOutline} size="small" slot="start" />
          <T>Help</T>
        </IonItem>
        <IonItem routerLink="/info/about" detail>
          <IonIcon icon={informationCircleOutline} size="small" slot="start" />
          <T>About</T>
        </IonItem>

        <IonItem routerLink="/info/credits" detail>
          <IonIcon icon={heartOutline} size="small" slot="start" />
          <T>Credits</T>
        </IonItem>

        <IonItem
          href={`${config.site_url}/privacy-notice?lang=${lang}`}
          target="_blank"
          detail
          detailIcon={openOutline}
        >
          <IonIcon icon={lockClosedOutline} size="small" slot="start" />
          <T>Privacy Policy</T>
        </IonItem>

        <IonItemDivider>
          <T>Settings</T>
        </IonItemDivider>
        <IonItem routerLink="/settings/menu" detail>
          <IonIcon icon={settingsOutline} size="small" slot="start" />
          <T>App</T>
        </IonItem>
      </IonList>
    </Main>
  );
});

Component.propTypes = {
  logOut: PropTypes.func,
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
};

export default Component;
