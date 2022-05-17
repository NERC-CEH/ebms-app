import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { InfoBackgroundMessage } from '@apps';
import appModel from 'models/appModel';

interface Props {
  name?: string;
  children: any;
}

const Message: FC<Props> = ({ name, children, ...props }) => {
  if (name && !appModel.attrs[name]) {
    return null;
  }

  const hideMessage = () => {
    (appModel.attrs as any)[name as any] = false;
    return {};
  };

  const onHide = name ? hideMessage : undefined;

  return (
    <InfoBackgroundMessage onHide={onHide} {...props}>
      {children}
    </InfoBackgroundMessage>
  );
};

export default observer(Message);
