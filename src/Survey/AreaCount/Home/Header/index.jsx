import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import { Header } from '@flumens';
import { Trans as T } from 'react-i18next';

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
      {label}
    </IonButton>
  );
}

const HeaderComponent = ({
  onSubmit,
  isTraining,
  isEditing,
  isDisabled,
  survey,
  isValid,
}) => {
  const trainingModeSubheader = isTraining && (
    <div className="training-survey">
      <T>Training Mode</T>
    </div>
  );

  return (
    <Header
      title={survey.label}
      rightSlot={!isDisabled && getFinishButton(onSubmit, isEditing, isValid)}
      subheader={trainingModeSubheader}
      defaultHref="/home/user-surveys"
    />
  );
};

HeaderComponent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  survey: PropTypes.object.isRequired,
  isTraining: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default HeaderComponent;
