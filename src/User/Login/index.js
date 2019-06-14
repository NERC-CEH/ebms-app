import React from 'react';
import PropTypes from 'prop-types';
import Log from 'helpers/log';
import Device from 'helpers/device';
import alert from 'common/helpers/alert';
import loader from 'common/helpers/loader';
import AppHeader from 'common/Components/Header';
import Main from './Main';

async function onLogin(userModel, details, onSuccess) {
  const { name, password } = details;
  if (!Device.isOnline()) {
    alert({
      header: t('Offline'),
      message: t("Sorry, looks like you're offline."),
      buttons: [t('OK')],
    });
    return;
  }
  await loader.show({
    message: t('Please wait...'),
  });

  const loginDetails = {
    name: name.trim(),
    password,
  };

  try {
    await userModel.logIn(loginDetails);

    onSuccess && onSuccess();
    window.history.back();
  } catch (err) {
    Log(err, 'e');
    alert({
      header: t('Sorry'),
      message: err.message,
      buttons: [t('OK')],
    });
  }

  loader.hide();
}

export default function LoginContainer({ userModel, onSuccess }) {
  return (
    <>
      <AppHeader title={t('Login')} />
      <Main
        schema={userModel.loginSchema}
        onSubmit={details => onLogin(userModel, details, onSuccess)}
      />
    </>
  );
}

LoginContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};
