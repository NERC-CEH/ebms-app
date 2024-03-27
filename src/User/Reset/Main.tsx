import clsx from 'clsx';
import { informationCircleOutline, mailOutline } from 'ionicons/icons';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Trans as T } from 'react-i18next';
import { TypeOf } from 'zod';
import { Main, Button, InfoMessage } from '@flumens';
import { zodResolver } from '@hookform/resolvers/zod';
import { IonIcon } from '@ionic/react';
import userModel from 'models/user';
import ControlledInput from '../common/Components/ControlledInput';

type Details = TypeOf<typeof userModel.resetSchema>;

type Props = {
  onSubmit: SubmitHandler<Details>;
};

const ResetMain = ({ onSubmit }: Props) => {
  const { formState, handleSubmit, control } = useForm<Details>({
    defaultValues: { email: '' },
    resolver: zodResolver(userModel.resetSchema),
  });

  return (
    <Main>
      <div className="mx-auto flex max-w-md flex-col gap-6 px-3 pt-3">
        <InfoMessage
          color="tertiary"
          startAddon={
            <IonIcon src={informationCircleOutline} className="size-5" />
          }
        >
          Enter your email address to request a password reset.
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
          </div>

          <Button
            className={clsx('mx-auto my-8', !formState.isValid && 'opacity-50')}
            color="primary"
            type="submit"
          >
            <T>Reset</T>
          </Button>
        </form>
      </div>
    </Main>
  );
};

export default ResetMain;
