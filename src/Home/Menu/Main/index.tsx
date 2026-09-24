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
import type { Attrs as UserData } from 'models/user';
import './styles.scss';

type Props = {
  isLoggedIn: boolean;
  user: UserData;
  logOut: () => void;
  appModel: typeof AppModelType;
  refreshAccount: () => void;
  resendVerificationEmail: () => void;
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

  const isNotVerified = user.verified === false; // verified is undefined in old versions
  const userEmail = user.email;

  return (
    <Main className="app-menu [--padding-top:env(safe-area-inset-top)] [--padding-bottom:30px]">
      <div className="text-center font-bold text-2xl w-full mt-5 mb-8 text-primary-800">
        <T>common.menu</T>
      </div>

      <IonList lines="full">
        <h3 className="list-title">
          <T>common.user</T>
        </h3>
        <div className="rounded-list">
          {isLoggedIn && (
            <IonItem detail id="logout-button" onClick={logOut}>
              <IonIcon icon={exitOutline} size="small" slot="start" />
              <div className="truncate">
                <T>menu.logout</T>
                {': '}
                <span className="ml-2">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </IonItem>
          )}

          {isLoggedIn && isNotVerified && (
            <InfoMessage className="verification-warning" skipTranslation>
              <T i18nKey="menu.unverifiedEmail" values={{ userEmail }}>
                Looks like your <b>{{ userEmail } as unknown as string}</b>{' '}
                email hasn't been verified yet.
                <div>
                  <IonButton fill="outline" onClick={refreshAccount}>
                    Refresh
                  </IonButton>
                  <IonButton fill="clear" onClick={resendVerificationEmail}>
                    Resend Email
                  </IonButton>
                </div>
              </T>
            </InfoMessage>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/login" detail>
              <IonIcon icon={personOutline} size="small" slot="start" />
              <T>common.login</T>
            </IonItem>
          )}

          {!isLoggedIn && (
            <IonItem routerLink="/user/register" detail>
              <IonIcon icon={personAddOutline} size="small" slot="start" />
              <T>common.register</T>
            </IonItem>
          )}
        </div>

        <h3 className="list-title">
          <T>settings.title</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/menu" detail>
            <IonIcon icon={settingsOutline} size="small" slot="start" />
            <T>menu.app</T>
          </IonItem>
        </div>

        <h3 className="list-title">
          <T>menu.info</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/info/guide" detail>
            <IonIcon icon={bookOutline} size="small" slot="start" />
            <T>common.instructions</T>
          </IonItem>
          <IonItem routerLink="/info/help" detail>
            <IonIcon icon={helpBuoyOutline} size="small" slot="start" />
            <T>common.help</T>
          </IonItem>
          <IonItem routerLink="/info/about" detail>
            <IonIcon
              icon={informationCircleOutline}
              size="small"
              slot="start"
            />
            <T>common.about</T>
          </IonItem>
          <IonItem routerLink="/info/credits" detail>
            <IonIcon icon={heartOutline} size="small" slot="start" />
            <T>common.credits</T>
          </IonItem>
          <IonItem
            href={`${config.backend.url}/privacy-notice?lang=${lang}`}
            target="_blank"
            detail
            detailIcon={openOutline}
          >
            <IonIcon icon={lockClosedOutline} size="small" slot="start" />
            <T>common.privacyPolicy</T>
          </IonItem>
        </div>
      </IonList>
    </Main>
  );
};

export default observer(MenuMain);
