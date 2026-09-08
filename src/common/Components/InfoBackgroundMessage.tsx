import { observer } from 'mobx-react';
import { InfoBackgroundMessage, InfoMessageProps } from '@flumens';
import { PickByType } from '@flumens/utils';
import appModel, { Data } from 'models/app';

type Props = InfoMessageProps & {
  name?: keyof PickByType<Data, boolean>;
};

const InfoBackgroundMessageWrap = ({ name, children, ...props }: Props) => {
  if (name && !appModel.data[name]) return null;

  // eslint-disable-next-line no-return-assign
  const onHide = name ? () => (appModel.data[name] = false) : undefined;

  return (
    <InfoBackgroundMessage {...props} onHide={onHide}>
      {children}
    </InfoBackgroundMessage>
  );
};

export default observer(InfoBackgroundMessageWrap);
