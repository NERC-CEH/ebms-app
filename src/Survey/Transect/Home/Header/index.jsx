import PropTypes from 'prop-types';
import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import { IonButton, IonLabel } from '@ionic/react';

function getFinishButton(onSubmit, isEditing, isValid) {
  const label = isEditing ? <T>Upload</T> : <T>Finish</T>;
  return (
    <IonButton
      color={isValid ? 'secondary' : 'medium'}
      fill="solid"
      shape="round"
      className="primary-button"
      onClick={onSubmit}
    >
      <IonLabel>{label}</IonLabel>
    </IonButton>
  );
}

const HeaderComponent = ({
  onSubmit,
  isTraining,
  isEditing,
  isDisabled,
  isValid,
}) => {
  const trainingModeSubheader = isTraining && (
    <div className="training-survey">
      <T>Training Mode</T>
    </div>
  );

  return (
    <Header
      title="Transect"
      rightSlot={!isDisabled && getFinishButton(onSubmit, isEditing, isValid)}
      subheader={trainingModeSubheader}
      defaultHref="/home/user-surveys"
    />
  );
};

HeaderComponent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isTraining: PropTypes.any.isRequired,
  isEditing: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default HeaderComponent;
