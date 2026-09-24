import { useContext } from 'react';
import { Trans as T } from 'react-i18next';
import { TypeOf } from 'zod';
import {
  Page,
  Header,
  device,
  useToast,
  useAlert,
  useLoader,
  DrupalUserError,
  DrupalUserErrorCode as E,
} from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'common/models/app';
import userModel, { UserModel } from 'models/user';
import Main from './Main';

type Details = TypeOf<typeof UserModel.registerSchema>;

const RegisterContainer = () => {
  const context = useContext(NavContext);
  const alert = useAlert();
  const toast = useToast();
  const loader = useLoader();

  const onSuccess = () => {
    context.navigate('/home/home', 'root');
  };

  async function onRegister(details: Details) {
    const email = details.email.trim();
    const { password, firstName, lastName } = details;

    /* eslint-disable @typescript-eslint/naming-convention */
    const otherDetails = {
      field_first_name: [{ value: firstName?.trim() }],
      field_last_name: [{ value: lastName?.trim() }],
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
      return;
    }
    await loader.show('common.pleaseWait');

    try {
      await userModel.register(email, password, otherDetails);

      userModel.data.firstName = firstName;
      userModel.data.lastName = lastName;
      userModel.save();

      alert({
        header: 'user.welcomeAboard',
        message: <T>user.beforeStartingAny</T>,
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
          error.code === E.EmailTaken ? 'user.emailTaken' : error.message
        );
      } else {
        toast.error(error);
      }
    }

    loader.hide();
  }

  return (
    <Page id="user-register">
      <Header className="ion-no-border" title="common.register" />
      <Main onSubmit={onRegister} lang={appModel.data.language!} />
    </Page>
  );
};

export default RegisterContainer;
