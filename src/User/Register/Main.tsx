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
import userModel from 'models/user';
import ControlledInput from '../common/Components/ControlledInput';

type Details = TypeOf<typeof userModel.registerSchema>;

type Props = {
  onSubmit: SubmitHandler<Details>;
  lang: string;
};

const RegisterMain = ({ onSubmit, lang }: Props) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const { formState, handleSubmit, control } = useForm<Details>({
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    resolver: zodResolver(userModel.registerSchema),
  });

  return (
    <Main>
      <div className="mx-auto max-w-md px-3">
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="rounded">
            <ControlledInput
              control={control}
              name="email"
              startAddon={
                <IonIcon icon={mailOutline} className="mx-2 opacity-60" />
              }
              type="email"
              autoComplete="off"
              placeholder="Email"
              platform="ios"
            />
            <ControlledInput
              control={control}
              name="firstName"
              startAddon={
                <IonIcon icon={personOutline} className="mx-2 opacity-60" />
              }
              autoComplete="off"
              placeholder="First Name"
              platform="ios"
            />
            <ControlledInput
              control={control}
              name="lastName"
              startAddon={
                <IonIcon icon={personOutline} className="mx-2 opacity-60" />
              }
              autoComplete="off"
              placeholder="Surname"
              platform="ios"
            />

            <ControlledInput
              control={control}
              name="password"
              startAddon={
                <IonIcon icon={keyOutline} className="mx-2 opacity-60" />
              }
              endAddon={
                <IonIcon
                  icon={showPassword ? eyeOutline : eyeOffOutline}
                  className="opacity-60"
                  onClick={togglePassword}
                />
              }
              type={showPassword ? 'text' : 'password'}
              autoComplete="off"
              placeholder="Password"
              platform="ios"
            />
          </div>

          <div className="px-5 py-1 text-sm">
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
            <T>Register</T>
          </Button>
        </form>
      </div>
    </Main>
  );
};

export default RegisterMain;
