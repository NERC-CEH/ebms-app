import { observer } from 'mobx-react';
import { InfoBackgroundMessage, InfoMessageProps } from '@flumens';
import appModel, { Data } from 'models/app';

interface Props extends InfoMessageProps {
  name?: keyof Data;
}

const InfoBackgroundMessageWrap = ({ name, children, ...props }: Props) => {
  if (name && !appModel.data[name]) return null;

  const onHide = name
    ? () => ((appModel.data as any)[name as any] = false) // eslint-disable-line
    : undefined;

  return (
    <InfoBackgroundMessage {...props} onHide={onHide}>
      {children}
    </InfoBackgroundMessage>
  );
};

export default observer(InfoBackgroundMessageWrap);
