import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TypeOf } from 'zod';
import {
  useToast,
  useLoader,
  Page,
  Header,
  device,
  DrupalUserError,
  DrupalUserErrorCode as E,
} from '@flumens';
import { NavContext } from '@ionic/react';
import userModel, { UserModel } from 'models/user';
import Main from './Main';

type Details = TypeOf<typeof UserModel.loginSchema>;

const LoginController = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const { t } = useTranslation();

  const onSuccessReturn = () => {
    const { email } = userModel.data;

    toast.success(t('user.successfullyLoggedAs', { email }), {
      skipTranslation: true,
    });

    navigate('/home/home', 'root');
  };

  async function onLogin({ email, password }: Details) {
    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
      return;
    }

    await loader.show('common.pleaseWait');

    try {
      await userModel.logIn(email.trim(), password);

      onSuccessReturn();
    } catch (err) {
      if (err instanceof DrupalUserError) {
        toast.error(
          err.code === E.InvalidCredentials
            ? 'user.incorrectCredentials'
            : err.message
        );
      } else {
        toast.error(err);
      }
    }

    loader.hide();
  }

  return (
    <Page id="user-login">
      <Header className="ion-no-border" title="common.login" />
      <Main onSubmit={onLogin} />
    </Page>
  );
};

export default LoginController;
