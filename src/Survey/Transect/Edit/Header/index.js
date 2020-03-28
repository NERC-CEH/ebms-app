import React from 'react';
import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import Header from 'Components/Header';
import './styles.scss';

function getFinishButton(onSubmit, isEditing) {
  const label = isEditing ? t('Upload') : t('Finish');
  return <IonButton onClick={onSubmit}>{label}</IonButton>;
}

const HeaderComponent = ({ onSubmit, isTraining, isEditing, isDisabled }) => {
  const trainingModeSubheader = isTraining && (
    <div className="training-survey">training survey</div>
  );

  return (
    <Header
      title={t('Transect')}
      rightSlot={!isDisabled && getFinishButton(onSubmit, isEditing)}
      subheader={trainingModeSubheader}
      defaultHref="/home/user-surveys"
    />
  );
};

HeaderComponent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isTraining: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default HeaderComponent;
