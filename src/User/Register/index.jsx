import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Log from 'helpers/log';
import { NavContext } from '@ionic/react';
import { Page, Header, loader, alert, toast, device } from '@apps';
import Main from './Main';

const { warn, error } = toast;

async function onRegister(userModel, details, lang, onSuccess) {
  const { email, password, firstname, secondname } = details;
  if (!device.isOnline()) {
    warn(t("Sorry, looks like you're offline."));
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
    lang,
  };

  try {
    await userModel.register(registrationDetails);
    alert({
      header: t('Welcome aboard!'),
      message: t(
        'Before submitting any records please check your email and click on the verification link.'
      ),
      buttons: [
        {
          text: t('OK, got it'),
          role: 'cancel',
          handler: onSuccess,
        },
      ],
    });
  } catch (err) {
    Log(err, 'e');
    error(`${err.message}`);
  }

  loader.hide();
}

export default function RegisterContainer({ userModel, appModel }) {
  const lang = appModel.attrs.language;
  const context = useContext(NavContext);

  const onSuccess = () => {
    context.goBack();
  };

  return (
    <Page id="user-register">
      <Header title="Register" />
      <Main
        schema={userModel.registerSchema}
        onSubmit={details => onRegister(userModel, details, lang, onSuccess)}
        lang={lang}
      />
    </Page>
  );
}

RegisterContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
};
