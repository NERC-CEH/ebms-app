import { observer } from 'mobx-react';
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
import { Main, InfoMessage } from '@flumens';
import { IonIcon, IonList, IonItem, IonButton } from '@ionic/react';
import config from 'common/config';
import AppModelType from 'models/app';
import logo from './logo.png';
import './styles.scss';

type Props = {
  isLoggedIn: boolean;
  user: any;
  logOut: any;
  appModel: typeof AppModelType;
  refreshAccount: any;
  resendVerificationEmail: any;
};

const MenuMain = ({
  isLoggedIn,
  user,
  logOut,
  appModel,
  refreshAccount,
  resendVerificationEmail,
}: Props) => {
  const lang = appModel.data.language;

  let userName = `${user.firstName} ${user.lastName}`;
  if (!user.firstName && !user.lastName) {
    // MIGRATION
    // backwards compatible until everyone migrates to JWT auth
    userName = `${user.firstname} ${user.secondname}`;
  }

  const isNotVerified = user.verified === false; // verified is undefined in old versions
  const userEmail = user.email;

  return (
    <Main className="app-menu [--padding-top:env(safe-area-inset-top)]">
      <img src={logo} alt="app logo" />

      <IonList lines="full">
        <h3 className="list-title">
          <T>User</T>
        </h3>
        <div className="rounded-list">
          {isLoggedIn && (
            <IonItem detail id="logout-button" onClick={logOut}>
              <IonIcon icon={exitOutline} size="small" slot="start" />
              <T>Logout</T>
              {': '}
              {userName}
            </IonItem>
          )}

          {isLoggedIn && isNotVerified && (
            <InfoMessage className="verification-warning">
              Looks like your <b>{{ userEmail } as any}</b> email hasn't been
              verified yet.
              <div>
                <IonButton fill="outline" onClick={refreshAccount}>
                  Refresh
                </IonButton>
                <IonButton fill="clear" onClick={resendVerificationEmail}>
                  Resend Email
                </IonButton>
              </div>
            </InfoMessage>
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
        </div>

        <h3 className="list-title">
          <T>Settings</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/menu" detail>
            <IonIcon icon={settingsOutline} size="small" slot="start" />
            <T>App</T>
          </IonItem>
        </div>

        <h3 className="list-title">
          <T>Info</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/info/guide" detail>
            <IonIcon icon={bookOutline} size="small" slot="start" />
            <T>Instructions</T>
          </IonItem>
          <IonItem routerLink="/info/help" detail>
            <IonIcon icon={helpBuoyOutline} size="small" slot="start" />
            <T>Help</T>
          </IonItem>
          <IonItem routerLink="/info/about" detail>
            <IonIcon
              icon={informationCircleOutline}
              size="small"
              slot="start"
            />
            <T>About</T>
          </IonItem>
          <IonItem routerLink="/info/credits" detail>
            <IonIcon icon={heartOutline} size="small" slot="start" />
            <T>Credits</T>
          </IonItem>
          <IonItem
            href={`${config.backend.url}/privacy-notice?lang=${lang}`}
            target="_blank"
            detail
            detailIcon={openOutline}
          >
            <IonIcon icon={lockClosedOutline} size="small" slot="start" />
            <T>Privacy Policy</T>
          </IonItem>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(MenuMain);
