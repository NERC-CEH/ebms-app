import { FC, useContext } from 'react';
import { useAlert } from '@flumens';
import { IonButtons, IonButton, NavContext, IonBackButton } from '@ionic/react';
import { Trans as T } from 'react-i18next';

function showDeleteSurveyAlertMessage(alert: any) {
  const deleteSurveyPromt = (resolve: (param: boolean) => void) => {
    alert({
      header: 'Delete Survey',
      message:
        'Warning - This will discard the survey information you have entered so far.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => resolve(false),
        },
        {
          text: 'Discard',
          cssClass: 'primary',
          handler: () => resolve(true),
        },
      ],
    });
  };

  return new Promise(deleteSurveyPromt);
}

interface Props {
  location: any;
}

const CancelButton: FC<Props> = ({ location }) => {
  const { goBack } = useContext(NavContext);
  const alert = useAlert();

  const onDeleteSurvey = async () => {
    const change = await showDeleteSurveyAlertMessage(alert);

    if (change) {
      await location.destroy();
      location.save();
      goBack();
    }
  };

  if (!location.isDraft()) {
    return (
      <IonButtons slot="start">
        <IonBackButton text="Back" data-label="back" defaultHref="/home" />
      </IonButtons>
    );
  }

  return (
    <IonButtons slot="start">
      <IonButton onClick={onDeleteSurvey}>
        <T>Cancel</T>
      </IonButton>
    </IonButtons>
  );
};

export default CancelButton;
