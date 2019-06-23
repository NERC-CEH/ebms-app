import React from 'react';
import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import AppHeader from 'common/Components/Header';
import './styles.scss';

function getFinishButton(onSubmit) {
  return (
    <IonButton fill="solid" onClick={onSubmit}>
      {t('Finish')}
    </IonButton>
  );
}

const Header = ({ onSubmit, isTraining }) => {
  const trainingModeSubheader = isTraining && (
    <div className="training-survey">training survey</div>
  );
  
  return (
    <AppHeader
      title={t('Area Count')}
      rightSlot={getFinishButton(onSubmit)}
      subheader={trainingModeSubheader}
    />
  );
};

Header.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isTraining: PropTypes.bool.isRequired,
};

export default Header;
