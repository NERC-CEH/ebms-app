import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import { Header } from '@flumens';
import { Trans as T } from 'react-i18next';

function getFinishButton(onSubmit, isEditing) {
  const label = isEditing ? <T>Upload</T> : <T>Finish</T>;
  return <IonButton onClick={onSubmit}>{label}</IonButton>;
}

const HeaderComponent = ({ onSubmit, isTraining, isEditing, isDisabled }) => {
  const trainingModeSubheader = isTraining && (
    <div className="training-survey">
      <T>Training Mode</T>
    </div>
  );

  return (
    <Header
      title="Transect"
      rightSlot={!isDisabled && getFinishButton(onSubmit, isEditing)}
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
