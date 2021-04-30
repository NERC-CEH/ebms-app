import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { InfoBackgroundMessage } from '@apps';
import appModel from 'appModel';

const Message = ({ name, ...props }) => {
  if (name && !appModel.attrs[name]) {
    return null;
  }

  const hideMessage = () => {
    appModel.attrs[name] = false; // eslint-disable-line
    appModel.save();
  };

  return <InfoBackgroundMessage onHide={name && hideMessage} {...props} />;
};

Message.propTypes = {
  name: PropTypes.string,
};

export default observer(Message);
