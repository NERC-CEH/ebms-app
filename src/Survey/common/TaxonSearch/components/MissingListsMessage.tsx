import { Trans as T } from 'react-i18next';
import { IonButton } from '@ionic/react';
import { InfoMessage } from 'common/flumens';

const MissingListsMessage = () => (
  <InfoMessage
    color="warning"
    className="mx-2 mb-2 text-center border-secondary-200"
    skipTranslation
  >
    <T
      i18nKey="survey.speciesListsMissing"
      components={{
        speciesLists: (
          <IonButton
            routerLink="/settings/species-lists"
            fill="outline"
            size="small"
            color="warning"
            className="mt-2"
          />
        ),
      }}
    />
  </InfoMessage>
);

export default MissingListsMessage;
