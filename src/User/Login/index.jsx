import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavContext } from '@ionic/react';
import Log from 'helpers/log';
import { Page, Header, loader, device, toast } from '@apps';
import Main from './Main';

const { warn, error } = toast;

async function onLogin(userModel, details, onSuccess) {
  const { email, password } = details;
  if (!device.isOnline()) {
    warn(t("Sorry, looks like you're offline."));
    return;
  }
  await loader.show({
    message: t('Please wait...'),
  });

  const loginDetails = {
    name: email.trim(),
    password,
  };

  try {
    await userModel.logIn(loginDetails);

    onSuccess();
  } catch (err) {
    Log(err, 'e');
    error(`${err.message}`);
  }

  loader.hide();
}

export default function LoginContainer({ userModel, onSuccess }) {
  const context = useContext(NavContext);

  const onSuccessReturn = () => {
    onSuccess && onSuccess();
    context.navigate('/home/report', 'root');
  };

  return (
    <Page id="user-login">
      <Header title="Login" />
      <Main
        schema={userModel.loginSchema}
        onSubmit={details => onLogin(userModel, details, onSuccessReturn)}
      />
    </Page>
  );
}

LoginContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};
