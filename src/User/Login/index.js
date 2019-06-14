import React from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';
import alert from 'common/helpers/alert';
import loader from 'common/helpers/loader';
import makeRequest from 'common/helpers/makeRequest';
import AppHeader from 'common/Components/Header';
import Main from './Main';

const schema = Yup.object().shape({
  name: Yup.string().required(),
  password: Yup.string().required(),
});

const schemaBackend = Yup.object().shape({
  id: Yup.number().required(),
  email: Yup.string()
    .email()
    .required(),
  name: Yup.string().required(),
});

async function login(details) {
  Log('User:Login: logging in.');

  const userAuth = btoa(`${details.name}:${details.password}`);
  const url = CONFIG.users.url + encodeURIComponent(details.name);
  const options = {
    headers: {
      authorization: `Basic ${userAuth}`,
      'x-api-key': CONFIG.indicia.api_key,
      'content-type': 'application/json',
    },
  };

  let res;
  try {
    res = await makeRequest(url, options, CONFIG.users.timeout);
    const isValidResponse = await schemaBackend.isValid(res.data);
    if (!isValidResponse) {
      throw new Error('invalid backend response.');
    }
  } catch (e) {
    throw new Error(`${t('Login error:')} ${t(e.message)}`);
  }

  return { ...res.data, ...{ password: details.password } };
}

export default function LoginContainer({ userModel, onSuccess }) {
  async function onLogin({ name, password }) {
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
      const userDetails = await login(loginDetails);
      userModel.logIn(userDetails);

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

  return (
    <>
      <AppHeader title={t('Login')} />
      <Main schema={schema} onSubmit={onLogin} />
    </>
  );
}

LoginContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};
