import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { IonPage, NavContext } from '@ionic/react';
import Log from 'helpers/log';
import Device from 'helpers/device';
import alert from 'common/helpers/alert';
import loader from 'common/helpers/loader';
import AppHeader from 'Components/Header';
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

    onSuccess();
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
  const context = useContext(NavContext);
  window.context = context;
  const onSuccessReturn = () => {
    onSuccess && onSuccess();
    if (context.currentPath === '/survey/new/edit') {
      // login page is not part of the same outlet when redirected from survey
      window.history.back();
      return;
    }

    context.goBack();
  };

  return (
    <IonPage>
      <AppHeader title={t('Login')} />
      <Main
        schema={userModel.loginSchema}
        onSubmit={details => onLogin(userModel, details, onSuccessReturn)}
      />
    </IonPage>
  );
}

LoginContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};
