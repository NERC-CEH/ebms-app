import { FC } from 'react';
import { observer } from 'mobx-react';
import Log from 'helpers/log';
import { IonItem, IonLabel, IonCheckbox } from '@ionic/react';
import { Page, useAlert } from '@flumens';
import appModel from 'models/app';
import userModel from 'models/user';
import savedSamples from 'models/collections/samples';
import { Trans as T } from 'react-i18next';
import Main from './Main';
import './styles.scss';

function showLogoutConfirmationDialog(callback: any, alert: any) {
  let deleteData = false;

  const onCheckboxChange = (e: any) => {
    deleteData = e.detail.checked;
  };

  alert({
    header: 'Logout',
    message: (
      <>
        <T>Are you sure you want to logout?</T>
        <br />
        <br />
        <IonItem lines="none" className="log-out-checkbox">
          <IonLabel>
            <T>Discard local data</T>
          </IonLabel>
          <IonCheckbox onIonChange={onCheckboxChange} />
        </IonItem>
      </>
    ),
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Logout',
        cssClass: 'primary',
        handler: () => callback(deleteData),
      },
    ],
  });
}

const Controller: FC = ({ ...restProps }) => {
  const alert = useAlert();

  function logOut() {
    Log('Info:Menu: logging out.');
    const resetWrap = async (reset: any) => {
      if (reset) {
        appModel.attrs['draftId:precise-area'] = '';
        appModel.attrs['draftId:transect'] = '';
        await savedSamples.resetDefaults();
      }

      appModel.attrs.transects = [];
      appModel.save();
      userModel.logOut();
    };
    showLogoutConfirmationDialog(resetWrap, alert);
  }

  const isLoggedIn = userModel.hasLogIn();

  const checkActivation = () => userModel.checkActivation();
  const resendVerificationEmail = () => userModel.resendVerificationEmail();

  return (
    <Page id="info-menu">
      <Main
        user={userModel.attrs}
        appModel={appModel}
        isLoggedIn={isLoggedIn}
        logOut={logOut}
        refreshAccount={checkActivation}
        resendVerificationEmail={resendVerificationEmail}
        {...restProps}
      />
    </Page>
  );
};

export default observer(Controller);
