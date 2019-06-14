import React from 'react';
import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import AppHeader from 'common/Components/Header';

function getFinishButton(onSubmit) {
  return (
    <IonButton fill="solid" onClick={onSubmit}>
      {t('Finish')}
    </IonButton>
  );
}

const Header = ({ onSubmit }) => (
  <AppHeader title={t('Area Count')} rightSlot={getFinishButton(onSubmit)} />
);

Header.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default Header;
