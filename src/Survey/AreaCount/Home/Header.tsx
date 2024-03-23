import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import { IonButton, IonLabel } from '@ionic/react';

function getFinishButton(
  onSubmit: any,
  isEditing?: boolean,
  isValid?: boolean
) {
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

type Props = {
  onSubmit: any;
  onProjectClick: any;
  isTraining?: boolean;
  isEditing?: boolean;
  isDisabled?: boolean;
  survey: any;
  project?: string;
  isValid?: boolean;
};

const HeaderComponent = ({
  onSubmit,
  isTraining,
  isEditing,
  isDisabled,
  survey,
  isValid,
  project,
  onProjectClick,
}: Props) => {
  const trainingModeSubheader = (
    <>
      {isTraining && (
        <div className="bg-black p-1 text-center text-sm text-white">
          <T>Training Mode</T>
        </div>
      )}

      {!!project && (
        <div
          className="line-clamp-1 bg-tertiary-600 p-1 text-center text-sm text-white"
          onClick={onProjectClick}
        >
          {project}
        </div>
      )}
    </>
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

export default HeaderComponent;
