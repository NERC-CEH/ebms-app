import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast, useLoader, Page, Header, device } from '@flumens';
import { NavContext } from '@ionic/react';
import { UserModel } from 'models/user';
import Main from './Main';
import './styles.scss';

export type Details = {
  password: string;
  email: string;
};

type Props = {
  userModel: UserModel;
};

const LoginController: FC<Props> = ({ userModel }) => {
  const context = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const { t } = useTranslation();

  const onSuccessReturn = () => {
    const { email } = userModel.attrs;

    toast.success(t('Successfully logged in as: {{email}}', { email }), {
      skipTranslation: true,
    });

    context.navigate('/home/user-surveys', 'root');
  };

  async function onLogin(details: Details) {
    const { email, password } = details;

    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    await loader.show('Please wait...');

    try {
      await userModel.logIn(email.trim(), password);

      onSuccessReturn();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
      console.error(err);
    }

    loader.hide();
  }

  return (
    <Page id="user-login">
      <Header className="ion-no-border" title="Login" />
      <Main schema={userModel.loginSchema} onSubmit={onLogin} />
    </Page>
  );
};

export default LoginController;
