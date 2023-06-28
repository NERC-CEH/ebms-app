import { FC } from 'react';
import { observer } from 'mobx-react';
import { cameraOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Page, Main, Header, InfoMessage, MenuAttrToggle } from '@flumens';
import { IonList, isPlatform } from '@ionic/react';
import AppModelProps from 'models/app';
import './styles.scss';

function onToggle(appModel: typeof AppModelProps, checked: boolean) {
  appModel.attrs.useImageIdentifier = checked; // eslint-disable-line no-param-reassign
  appModel.save();
}

type Props = {
  appModel: typeof AppModelProps;
};

const MothSurveySettings: FC<Props> = ({ appModel }) => {
  const { useImageIdentifier } = appModel.attrs;

  const onTurnOffImageIdentifierToggle = (checked: boolean) => {
    onToggle(appModel, checked);

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  return (
    <Page id="moth-survey-settings">
      <Header title="Moth Survey Settings" />

      <Main>
        <IonList lines="full">
          <div className="rounded">
            <MenuAttrToggle
              icon={cameraOutline}
              label="Use image identification"
              value={useImageIdentifier}
              onChange={onTurnOffImageIdentifierToggle}
            />
            <InfoMessage color="medium">
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
