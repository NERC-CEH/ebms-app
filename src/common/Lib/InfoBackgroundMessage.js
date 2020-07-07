import React from 'react';
import { InfoBackgroundMessage } from '@apps';
import appModel from 'app_model';

export default props => (
  <InfoBackgroundMessage appModel={appModel} {...props} />
);
