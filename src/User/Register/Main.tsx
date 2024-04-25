import { useState } from 'react';
import clsx from 'clsx';
import {
  keyOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
  mailOutline,
} from 'ionicons/icons';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Trans as T } from 'react-i18next';
import { TypeOf } from 'zod';
import { Main, Button } from '@flumens';
import { zodResolver } from '@hookform/resolvers/zod';
import { IonIcon, IonRouterLink } from '@ionic/react';
import config from 'common/config';
import { UserModel } from 'models/user';
import ControlledInput from '../common/Components/ControlledInput';

type Details = TypeOf<typeof UserModel.registerSchema>;

type Props = {
  onSubmit: SubmitHandler<Details>;
  lang: string;
};

const RegisterMain = ({ onSubmit, lang }: Props) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const { formState, handleSubmit, control } = useForm<Details>({
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    resolver: zodResolver(UserModel.registerSchema),
  });

  return (
    <Main>
      <div className="mx-auto max-w-md px-3">
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="rounded-list">
            <ControlledInput
              control={control}
              name="firstName"
              prefix={<IonIcon icon={personOutline} className="size-5" />}
              placeholder="First Name"
            />
            <ControlledInput
              control={control}
              name="lastName"
              prefix={<IonIcon icon={personOutline} className="size-5" />}
              placeholder="Surname"
            />
            <ControlledInput
              control={control}
              name="email"
              prefix={<IonIcon icon={mailOutline} className="size-5" />}
              type="email"
              placeholder="Email"
            />

            <ControlledInput
              control={control}
              name="password"
              prefix={<IonIcon icon={keyOutline} className="size-5" />}
              suffix={
                <IonIcon
                  icon={showPassword ? eyeOutline : eyeOffOutline}
                  className="size-5 opacity-50"
                  onClick={togglePassword}
                />
              }
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
            />
          </div>

          <div className="mt-4 px-5 text-sm">
            <T>I agree to</T>{' '}
            <IonRouterLink
              href={`${config.backend.url}/privacy-notice?lang=${lang}`}
            >
              <T>Privacy Policy</T>
            </IonRouterLink>{' '}
            <T>and</T>{' '}
            <IonRouterLink
              href={`${config.backend.url}/terms-and-conditions?lang=${lang}`}
            >
              <T>Terms and Conditions</T>
            </IonRouterLink>
          </div>

          <Button
            className={clsx('mx-auto mt-8', !formState.isValid && 'opacity-50')}
            color="primary"
            type="submit"
          >
            Register
          </Button>
        </form>
      </div>
    </Main>
  );
};

export default RegisterMain;
