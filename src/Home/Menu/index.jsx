import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Log from 'helpers/log';
import { IonItem, IonLabel, IonCheckbox } from '@ionic/react';
import { Page, alert } from '@apps';
import { Trans as T } from 'react-i18next';
import Main from './Main';
import './styles.scss';

function showLogoutConfirmationDialog(callback) {
  let deleteData = true;

  const onCheckboxChange = e => {
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
          <IonCheckbox checked onIonChange={onCheckboxChange} />
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

const Controller = observer(props => {
  const { userModel, appModel, savedSamples, ...restProps } = props;

  function logOut() {
    Log('Info:Menu: logging out.');
    showLogoutConfirmationDialog(async reset => {
      if (reset) {
        appModel.attrs['draftId:area'] = null;
        appModel.attrs['draftId:precise-area'] = null;
        appModel.attrs['draftId:transect'] = null;
        await savedSamples.resetDefaults();
      }

      appModel.attrs.transects = [];
      appModel.save();
      userModel.logOut();
    });
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
});

Controller.propTypes = {
  userModel: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  savedSamples: PropTypes.array.isRequired,
};

export default Controller;
