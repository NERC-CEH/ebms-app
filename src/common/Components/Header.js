import React from 'react';
import PropTypes from 'prop-types';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
} from '@ionic/react';

const defaultOnLeave = () => window.history.back();

const Header = ({ title }) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonBackButton
          onClick={defaultOnLeave}
          text={t('Back')}
          defaultHref="/"
        />
      </IonButtons>
      <IonTitle>{title}</IonTitle>
    </IonToolbar>
  </IonHeader>
);

Header.propTypes = {
  title: PropTypes.string,
};

export default Header;
