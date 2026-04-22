import { observer } from 'mobx-react';
import { cameraOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Page, Main, Header, InfoMessage, Toggle, SelectInput } from '@flumens';
import { IonIcon, IonList, isPlatform } from '@ionic/react';
import appModel from 'models/app';
import './styles.scss';

const SUNSET_OFFSET_OPTIONS = [
  { value: '-45', label: '-45 mins' },
  { value: '-40', label: '-40 mins' },
  { value: '-35', label: '-35 mins' },
  { value: '-30', label: '-30 mins' },
  { value: '-25', label: '-25 mins' },
  { value: '-20', label: '-20 mins' },
  { value: '-15', label: '-15 mins' },
  { value: '-10', label: '-10 mins' },
  { value: '-5', label: '-5 mins' },
  { value: '0', label: 'No offset' },
  { value: '5', label: '+5 mins' },
  { value: '10', label: '+10 mins' },
  { value: '15', label: '+15 mins' },
  { value: '20', label: '+20 mins' },
  { value: '25', label: '+25 mins' },
  { value: '30', label: '+30 mins' },
  { value: '35', label: '+35 mins' },
  { value: '40', label: '+40 mins' },
  { value: '45', label: '+45 mins' },
];

const SUNRISE_OFFSET_OPTIONS = SUNSET_OFFSET_OPTIONS;

const MothSurveySettings = () => {
  const { useImageIdentifier, mothSunsetOffset, mothSunriseOffset } =
    appModel.data;

  const onTurnOffImageIdentifierToggle = (checked: boolean) => {
    appModel.data.useImageIdentifier = checked;
    appModel.save();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  const onSunsetOffsetChange = (value: string) => {
    appModel.data.mothSunsetOffset = parseInt(value, 10);
    appModel.save();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  const onSunriseOffsetChange = (value: string) => {
    appModel.data.mothSunriseOffset = parseInt(value, 10);
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
            <SelectInput
              prefix={<IonIcon icon={moonOutline} className="size-6" />}
              label="Sunset offset"
              value={`${mothSunsetOffset}`}
              onChange={onSunsetOffsetChange}
              options={SUNSET_OFFSET_OPTIONS}
            />
            <SelectInput
              prefix={<IonIcon icon={sunnyOutline} className="size-6" />}
              label="Sunrise offset"
              value={`${mothSunriseOffset}`}
              onChange={onSunriseOffsetChange}
              options={SUNRISE_OFFSET_OPTIONS}
            />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(MothSurveySettings);
