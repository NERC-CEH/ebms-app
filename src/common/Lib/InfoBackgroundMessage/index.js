import React from 'react';
import PropTypes from 'prop-types';
import { IonItem, IonButton } from '@ionic/react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import appModel from 'app_model';
import './styles.scss';

function Message({ name, children }) {
  if (name && !appModel.attrs[name]) {
    return null;
  }
  const showHideButton = !!name;

  const hideMessage = () => {
    appModel.attrs[name] = false;
    appModel.save();
  };

  return (
    <IonItem className="info-background-message">
      <span>
        <T>{children}</T>
      </span>

      {showHideButton && (
        <IonButton fill="outline" size="small" onClick={hideMessage}>
          <T>Hide</T>
        </IonButton>
      )}
    </IonItem>
  );
}

Message.propTypes = {
  name: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default observer(Message);
