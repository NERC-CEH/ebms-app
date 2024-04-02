import { useState } from 'react';
import clsx from 'clsx';
import {
  keyOutline,
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Trans as T } from 'react-i18next';
import { TypeOf } from 'zod';
import { Main, Button, InfoMessage } from '@flumens';
import { zodResolver } from '@hookform/resolvers/zod';
import { IonIcon, IonItem } from '@ionic/react';
import { UserModel } from 'models/user';
import ControlledInput from '../common/Components/ControlledInput';

type Details = TypeOf<typeof UserModel.loginSchema>;

type Props = {
  onSubmit: SubmitHandler<Details>;
};

const LoginMain = ({ onSubmit }: Props) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const { formState, handleSubmit, control } = useForm<Details>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(UserModel.loginSchema),
  });

  return (
    <Main>
      <div className="mx-auto flex max-w-md flex-col gap-8 px-3 pt-3">
        <InfoMessage
          color="tertiary"
          startAddon={
            <IonIcon src={informationCircleOutline} className="size-5" />
          }
        >
          Please sign in with your eBMS account or register.
        </InfoMessage>

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <Button
            className={clsx('mx-auto mt-7', !formState.isValid && 'opacity-50')}
            color="primary"
            type="submit"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-8 rounded">
          <IonItem routerLink="/user/register" detail>
            <T>Register</T>
          </IonItem>
          <IonItem routerLink="/user/reset" detail>
            <T>Forgot password?</T>
          </IonItem>
        </div>
      </div>
    </Main>
  );
};

export default LoginMain;
