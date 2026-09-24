import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Page, useAlert, useLoader, useToast } from '@flumens';
import appModel from 'models/app';
import userModel from 'models/user';
import Main from './Main';
import './styles.scss';

function showLogoutConfirmationDialog(
  callback: () => void,
  alert: ReturnType<typeof useAlert>
) {
  alert({
    header: 'menu.logout',
    message: (
      <T i18nKey="menu.confirmLogoutPending">
        Are you sure you want to logout?
        <br />
        <br />
        Your pending and uploaded <b>records will not be deleted </b> from this
        device.
      </T>
    ),
    buttons: [
      {
        text: 'common.cancel',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'menu.logout',
        cssClass: 'primary',
        handler: () => callback(),
      },
    ],
  });
}

const Controller = ({ ...restProps }) => {
  const alert = useAlert();
  const loader = useLoader();
  const toast = useToast();

  function logOut() {
    console.log('Info:Menu: logging out.');
    const resetWrap = async () => {
      userModel.logOut();
    };
    showLogoutConfirmationDialog(resetWrap, alert);
  }

  const isLoggedIn = userModel.isLoggedIn();

  const checkActivation = async () => {
    await loader.show('common.pleaseWait');
    try {
      await userModel.checkActivation();
      if (!userModel.data.verified) {
        toast.warn('menu.userHasNot');
      }
    } catch (error) {
      toast.error(error as Error);
    }
    loader.hide();
  };

  const resendVerificationEmail = async () => {
    await loader.show('common.pleaseWait');
    try {
      await userModel.resendVerificationEmail();
      toast.success('common.newVerificationEmail');
    } catch (error) {
      toast.error(error as Error);
    }
    loader.hide();
  };

  return (
    <Page id="info-menu">
      <Main
        user={userModel.data}
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
