import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import Log from 'helpers/log';
import alert from 'common/helpers/alert';
import AppHeader from 'Components/Header';
import Main from './Main';

function showLogoutConfirmationDialog(callback) {
  alert({
    header: t('Logout'),
    message: `${t('Are you sure you want to logout?')}<p><i>${t(
      'This will delete all the records on this device.'
    )}</i></p>`,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: t('Logout'),
        cssClass: 'primary',
        handler: callback,
      },
    ],
  });
}

const Controller = observer(props => {
  const { userModel, appModel, savedSamples, ...restProps } = props;

  function logOut() {
    Log('Info:Menu: logging out.');
    showLogoutConfirmationDialog(() => {
      appModel.set('areaCountDraftId', null).save();
      userModel.logOut();
      return savedSamples.resetDefaults();
    });
  }

  const isLoggedIn = userModel.hasLogIn();
  return (
    <IonPage>
      <AppHeader title={t('Menu')} />
      <Main
        user={userModel.attrs}
        appModel={appModel}
        isLoggedIn={isLoggedIn}
        logOut={logOut}
        {...restProps}
      />
    </IonPage>
  );
});

Controller.propTypes = {
  userModel: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  savedSamples: PropTypes.object.isRequired,
};

export default Controller;
