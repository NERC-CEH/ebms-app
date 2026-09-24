import { useContext } from 'react';
import { Trans as T } from 'react-i18next';
import { TypeOf } from 'zod';
import {
  useToast,
  useLoader,
  Page,
  Header,
  device,
  useAlert,
  DrupalUserError,
  DrupalUserErrorCode as E,
} from '@flumens';
import { NavContext } from '@ionic/react';
import userModel, { UserModel } from 'models/user';
import Main from './Main';

type Details = TypeOf<typeof UserModel.resetSchema>;

const LoginController = () => {
  const { navigate } = useContext(NavContext);
  const alert = useAlert();

  const toast = useToast();
  const loader = useLoader();

  const onSuccess = () => {
    navigate('/home/menu', 'root');
  };

  async function onSubmit(details: Details) {
    const { email } = details;
    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
      return;
    }
    await loader.show('common.pleaseWait');

    try {
      await userModel.resetPassword(email.trim());
      alert({
        header: 'user.weVeSent',
        message: <T>user.clickLinkEmail</T>,
        buttons: [
          {
            text: 'common.okGotIt',
            role: 'cancel',
            handler: onSuccess,
          },
        ],
      });
    } catch (error) {
      if (error instanceof DrupalUserError) {
        toast.error(
          error.code === E.UnrecognizedEmail
            ? 'user.unrecognizedEmail'
            : error.message
        );
      } else {
        toast.error(error);
      }
    }

    loader.hide();
  }

  return (
    <Page id="user-reset">
      <Header className="ion-no-border" title="user.reset" />
      <Main onSubmit={onSubmit} />
    </Page>
  );
};

export default LoginController;
