import { observer } from 'mobx-react';
import { cameraOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Page, Main, Header, InfoMessage, Toggle } from '@flumens';
import { IonIcon, IonList, isPlatform } from '@ionic/react';
import appModel from 'models/app';
import './styles.scss';

const MothSurveySettings = () => {
  const { useImageIdentifier } = appModel.attrs;

  const onTurnOffImageIdentifierToggle = (checked: boolean) => {
    appModel.attrs.useImageIdentifier = checked; // eslint-disable-line no-param-reassign
    appModel.save();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  return (
    <Page id="moth-survey-settings">
      <Header title="Moth Survey Settings" />

      <Main>
        <IonList lines="full">
          <div className="rounded-list">
            <Toggle
              prefix={<IonIcon src={cameraOutline} className="size-6" />}
              label="Use image identification"
              defaultSelected={useImageIdentifier}
              onChange={onTurnOffImageIdentifierToggle}
            />
            <InfoMessage inline>
              We will help you to identify species using our species image
              classifier.
            </InfoMessage>
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothSurveySettings);
