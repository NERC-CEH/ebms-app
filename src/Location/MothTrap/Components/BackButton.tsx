import { useContext } from 'react';
import { Trans as T } from 'react-i18next';
import { useAlert } from '@flumens';
import { IonButtons, IonButton, NavContext, IonBackButton } from '@ionic/react';

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
          handler: () => resolve(false),
        },
        {
          text: 'Discard',
          role: 'destructive',
          handler: () => resolve(true),
        },
      ],
    });
  };

  return new Promise(deleteSurveyPromt);
}

type Props = {
  location: any;
};

const CancelButton = ({ location }: Props) => {
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

  if (!location.isDraft) {
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
