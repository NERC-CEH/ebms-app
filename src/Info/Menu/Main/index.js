import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { IonIcon, IonList, IonItem, IonItemDivider } from '@ionic/react';
import {
  settings,
  exit,
  person,
  personAdd,
  lock,
  heart,
  informationCircleOutline,
  helpBuoy,
  book,
  open,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import Main from 'Lib/Main';
import config from 'config';
import './styles.scss';
import './logo.png';

const Component = observer(({ isLoggedIn, user, logOut, appModel }) => {
  const lang = appModel.attrs.language;

  return (
    <Main class="app-menu">
      <img src="/images/logo.png" alt="app logo" />

      <IonList lines="full">
        {isLoggedIn && (
          <IonItem detail id="logout-button" onClick={logOut}>
            <IonIcon icon={exit} size="small" slot="start" />
            <T>Logout</T>
            {': '}
            {user.firstname} {user.secondname}
          </IonItem>
        )}

        {!isLoggedIn && (
          <IonItem routerLink="/user/login" detail>
            <IonIcon icon={person} size="small" slot="start" />
            <T>Login</T>
          </IonItem>
        )}

        {!isLoggedIn && (
          <IonItem routerLink="/user/register" detail>
            <IonIcon icon={personAdd} size="small" slot="start" />
            <T>Register</T>
          </IonItem>
        )}

        <IonItemDivider>
          <T>Info</T>
        </IonItemDivider>
        <IonItem routerLink="/info/guide" detail>
          <IonIcon icon={book} size="small" slot="start" />
          <T>Guide</T>
        </IonItem>
        <IonItem routerLink="/info/help" detail>
          <IonIcon icon={helpBuoy} size="small" slot="start" />
          <T>Help</T>
        </IonItem>
        <IonItem routerLink="/info/about" detail>
          <IonIcon icon={informationCircleOutline} size="small" slot="start" />
          <T>About</T>
        </IonItem>

        <IonItem routerLink="/info/credits" detail>
          <IonIcon icon={heart} size="small" slot="start" />
          <T>Credits</T>
        </IonItem>

        <IonItem
          href={`${config.site_url}/privacy-notice?lang=${lang}`}
          target="_blank"
          detail
          detailIcon={open}
        >
          <IonIcon icon={lock} size="small" slot="start" />
          <T>Privacy Policy</T>
        </IonItem>

        <IonItemDivider>
          <T>Settings</T>
        </IonItemDivider>
        <IonItem routerLink="/settings/menu" detail>
          <IonIcon icon={settings} size="small" slot="start" />
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
