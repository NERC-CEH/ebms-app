import React from 'react';
import PropTypes from 'prop-types';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
} from '@ionic/react';

const Header = ({ title, subheader, rightSlot }) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonBackButton
          text={t('Back')}
          defaultHref="/"
        />
      </IonButtons>
      <IonTitle>{title}</IonTitle>
      {rightSlot && <IonButtons slot="end">{rightSlot}</IonButtons>}
    </IonToolbar>
    {subheader && <IonToolbar>{subheader}</IonToolbar>}
  </IonHeader>
);

Header.propTypes = {
  title: PropTypes.string,
  rightSlot: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  subheader: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Header;
