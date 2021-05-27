import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { NavContext } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { Page, Header, alert, toast, loader, device } from '@apps';
import Main from './Main';

const { warn, error } = toast;

async function onSubmit(userModel, details, onSuccess, t) {
  const { email } = details;

  if (!device.isOnline()) {
    warn(t("Sorry, looks like you're offline"));
    return;
  }

  await loader.show({
    message: t('Please wait...'),
  });

  try {
    await userModel.reset(email.trim());

    alert({
      header: "We've sent an email to you",
      message: t(
        "Click the link in the email to reset your password. If you don't see the email, check other places like your junk, spam or other folders."
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

export default function Container({ userModel }) {
  const context = useContext(NavContext);
  const { t } = useTranslation();

  const onSuccess = () => {
    context.goBack();
  };

  return (
    <Page id="user-reset">
      <Header title="Reset" />
      <Main
        schema={userModel.resetSchema}
        onSubmit={details => onSubmit(userModel, details, onSuccess, t)}
      />
    </Page>
  );
}

Container.propTypes = {
  userModel: PropTypes.object.isRequired,
};
