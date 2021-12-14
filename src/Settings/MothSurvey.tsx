import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import AppModelProps from 'models/appModel';
import { Page, Main, Header, InfoMessage, Toggle } from '@apps';
import { cameraOutline } from 'ionicons/icons';

function onToggle(appModel: typeof AppModelProps, checked: boolean) {
  appModel.attrs.autoImageIdentifier = checked; // eslint-disable-line no-param-reassign
  appModel.save();
}

type Props = {
  appModel: typeof AppModelProps;
};

const MothSurveySettings: FC<Props> = ({ appModel }) => {
  const { autoImageIdentifier } = appModel.attrs;

  const onTurnOffImageIdentifierToggle = (checked: boolean) =>
    onToggle(appModel, checked);

  return (
    <Page id="moth-survey">
      <Header title="Moth Survey Settings" />

      <Main>
        <IonList lines="full">
          <div className="rounded">
            <IonItem>
              <IonIcon icon={cameraOutline} size="small" slot="start" />
              <IonLabel>
                <T>Auto image identifier</T>
              </IonLabel>
              <Toggle
                onToggle={onTurnOffImageIdentifierToggle}
                checked={autoImageIdentifier}
              />
            </IonItem>
            <InfoMessage color="medium">
              We will help you to identify species.
            </InfoMessage>
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothSurveySettings);
