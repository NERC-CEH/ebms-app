import { observer } from 'mobx-react';
import { InfoBackgroundMessage, InfoMessageProps } from '@flumens';
import appModel, { Attrs } from 'models/app';

interface Props extends InfoMessageProps {
  name?: keyof Attrs;
}

const InfoBackgroundMessageWrap = ({ name, children, ...props }: Props) => {
  if (name && !appModel.attrs[name]) return null;

  const onHide = name
    ? () => ((appModel.attrs as any)[name as any] = false) // eslint-disable-line
    : undefined;

  return (
    <InfoBackgroundMessage {...props} onHide={onHide}>
      {children}
    </InfoBackgroundMessage>
  );
};

export default observer(InfoBackgroundMessageWrap);
