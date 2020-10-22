import React from 'react';
import { InfoBackgroundMessage } from '@apps';
import appModel from 'appModel';

export default props => (
  <InfoBackgroundMessage appModel={appModel} {...props} />
);
