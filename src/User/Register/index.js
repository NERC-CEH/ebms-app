import React from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import Log from 'helpers/log';
import Device from 'helpers/device';
import CONFIG from 'config';
import alert from 'common/helpers/alert';
import loader from 'common/helpers/loader';
import makeRequest from 'common/helpers/makeRequest';
import Register from './Register';

const schema = Yup.object().shape({
  email: Yup.string()
    .email()
    .required(),
  firstname: Yup.string().required(),
  secondname: Yup.string().required(),
  password: Yup.string().required(),
  terms: Yup.boolean()
    .oneOf([true], 'Must Accept Terms and Conditions')
    .required(),
});

const schemaBackend = Yup.object().shape({
  id: Yup.number().required(),
  warehouse_id: Yup.number().required(),
  email: Yup.string()
    .email()
    .required(),
  name: Yup.string().required(),
  firstname: Yup.string().required(),
  secondname: Yup.string().required(),
});

async function register(details) {
  Log('User:Register: registering.');
  const userAuth = btoa(`${details.name}:${details.password}`);
  const options = {
    method: 'post',
    mode: 'cors',
    headers: {
      authorization: `Basic ${userAuth}`,
      'x-api-key': CONFIG.indicia.api_key,
      "content-type": "plain/text",
    },
    body: JSON.stringify({ data: details }),
  };

  let res;
  try {
    res = await makeRequest(CONFIG.users.url, options, CONFIG.users.timeout);
    const isValidResponse = await schemaBackend.isValid(res);
    if (!isValidResponse) {
      throw new Error('invalid backend response.');
    }
  } catch (e) {
    throw new Error(`${t('Registration error:')} ${t(e.message)}`);
  }

  return { ...res, ...{ password: details.password } };
}

export default function RegisterContainer({ userModel }) {
  async function onRegister({ email, password, firstname, secondname }) {
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

    const registrationDetails = {
      type: 'users',
      email: email.trim(),
      firstname: firstname.trim(),
      secondname: secondname.trim(),
      password,
      passwordConfirm: password,
      termsAgree: true,
    };

    try {
      const userDetails = await register(registrationDetails);
      userModel.logIn(userDetails);
      alert({
        header: t('Welcome aboard!'),
        message: t(
          'Before submitting any records please check your email and click on the verification link.'
        ),
        buttons: [
          {
            text: t('OK, got it'),
            role: 'cancel',
            handler() {
              window.history.back();
            },
          },
        ],
      });
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

  return <Register schema={schema} onSubmit={onRegister} />;
}

RegisterContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
};
