import { IonButton } from '@ionic/react';
import { InfoMessage } from 'common/flumens';

const MissingListsMessage = () => (
  <InfoMessage
    color="warning"
    className="mx-2 mb-2 text-center border-secondary-200"
  >
    Some species groups are missing from your current downloaded lists.
    <br />
    <IonButton
      routerLink="/settings/species-lists"
      fill="outline"
      size="small"
      color="warning"
      className="mt-2"
    >
      Species Lists
    </IonButton>
  </InfoMessage>
);

export default MissingListsMessage;
