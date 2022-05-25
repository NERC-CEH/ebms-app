import { FC } from 'react';
import { observer } from 'mobx-react';
import Log from 'helpers/log';
import { Page, useAlert } from '@flumens';
import appModel from 'models/app';
import userModel from 'models/user';
import { Trans as T } from 'react-i18next';
import Main from './Main';
import './styles.scss';

function showLogoutConfirmationDialog(callback: any, alert: any) {
  alert({
    header: 'Logout',
    message: (
      <T>
        Are you sure you want to logout?
        <br />
        <br />
        Your pending and uploaded <b>records will not be deleted </b> from this
        device.
      </T>
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
        handler: () => callback(),
      },
    ],
  });
}

const Controller: FC = ({ ...restProps }) => {
  const alert = useAlert();

  function logOut() {
    Log('Info:Menu: logging out.');
    const resetWrap = async () => {
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
