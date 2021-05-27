import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavContext } from '@ionic/react';
import { Page, Header, loader, alert, toast, device } from '@apps';
import { Trans as T, useTranslation } from 'react-i18next';
import Main from './Main';

const { warn, error } = toast;

async function onRegister(userModel, details, onSuccess, t) {
  const { password, firstName, secondName } = details;

  const email = details.email.trim();

  const otherDetails = {
    field_first_name: [{ value: firstName.trim() }],
    field_last_name: [{ value: secondName.trim() }],
  };

  if (!device.isOnline()) {
    warn("Sorry, looks like you're offline.");
    return;
  }

  await loader.show({
    message: t('Please wait...'),
  });

  try {
    await userModel.register(email, password, otherDetails);

    userModel.attrs.firstName = firstName; // eslint-disable-line
    userModel.attrs.secondName = secondName; // eslint-disable-line
    userModel.save();

    alert({
      header: 'Welcome aboard!',
      message: (
        <T>
          Before submitting any records please check your email and click on the
          verification link.
        </T>
      ),
      buttons: [
        {
          text: 'OK, got it',
          role: 'cancel',
          handler: onSuccess,
        },
      ],
    });
  } catch (err) {
    console.error(err, 'e');
    error(err.message);
  }

  loader.hide();
}

export default function RegisterContainer({ userModel, appModel }) {
  const lang = appModel.attrs.language;
  const context = useContext(NavContext);
  const { t } = useTranslation();

  const onSuccess = context.goBack;

  return (
    <Page id="user-register">
      <Header title="Register" />
      <Main
        schema={userModel.registerSchema}
        onSubmit={details => onRegister(userModel, details, onSuccess, t)}
        lang={lang}
      />
    </Page>
  );
}

RegisterContainer.propTypes = {
  userModel: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
};
