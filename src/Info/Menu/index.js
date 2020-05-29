import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Log from 'helpers/log';
import alert from 'common/helpers/alert';
import Page from 'Lib/Page';
import Header from 'Lib/Header';
import { resetDefaults } from 'saved_samples';
import Main from './Main';
import './styles.scss';

function showLogoutConfirmationDialog(callback) {
  alert({
    header: t('Logout'),
    message: `${t('Are you sure you want to logout?')}`,
    inputs: [
      {
        name: 'reset',
        type: 'checkbox',
        label: t('Discard local data'),
        value: 'reset',
        checked: true,
        id: 'showLogoutConfirmationDialog',
      },
    ],
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
    showLogoutConfirmationDialog(async ([reset]) => {
      if (reset) {
        appModel.attrs.areaCountDraftId = null;
        await resetDefaults();
      }

      appModel.attrs.transects = [];
      appModel.save();
      userModel.logOut();
    });
  }

  const isLoggedIn = userModel.hasLogIn();
  return (
    <Page id="info-menu">
      <Header title={t('Menu')} />
      <Main
        user={userModel.attrs}
        appModel={appModel}
        isLoggedIn={isLoggedIn}
        logOut={logOut}
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
