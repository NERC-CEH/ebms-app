import { observer } from 'mobx-react';
import { closeCircleOutline } from 'ionicons/icons';
import { twMerge } from 'tailwind-merge';
import { InfoMessage, InfoMessageProps } from '@flumens';
import { IonIcon } from '@ionic/react';
import appModel, { Attrs } from 'models/app';

interface Props extends InfoMessageProps {
  name?: keyof Attrs;
}

const InfoBackgroundMessage = ({
  name,
  children,
  className,
  ...props
}: Props) => {
  if (name && !appModel.attrs[name]) return null;

  const onHide = name
    ? () => ((appModel.attrs as any)[name as any] = false) // eslint-disable-line
    : undefined;

  const hideButton = onHide ? (
    <IonIcon
      src={closeCircleOutline}
      className="size-6 opacity-40"
      onClick={onHide}
    />
  ) : undefined;

  return (
    <InfoMessage
      {...props}
      className={twMerge(
        'mx-auto my-12 w-4/5 max-w-60 bg-white text-center shadow-sm',
        className
      )}
      endAddon={hideButton}
    >
      {children}
    </InfoMessage>
  );
};

export default observer(InfoBackgroundMessage);
