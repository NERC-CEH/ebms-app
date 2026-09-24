import { observer } from 'mobx-react';
import { cameraOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Page, Main, Header, InfoMessage, Toggle, SelectInput } from '@flumens';
import { IonIcon, IonList, isPlatform } from '@ionic/react';
import appModel from 'models/app';
import './styles.scss';

const SUNSET_OFFSET_OPTIONS = [
  { value: '-45', label: 'settings.offset.minus45' },
  { value: '-40', label: 'settings.offset.minus40' },
  { value: '-35', label: 'settings.offset.minus35' },
  { value: '-30', label: 'settings.offset.minus30' },
  { value: '-25', label: 'settings.offset.minus25' },
  { value: '-20', label: 'settings.offset.minus20' },
  { value: '-15', label: 'settings.offset.minus15' },
  { value: '-10', label: 'settings.offset.minus10' },
  { value: '-5', label: 'settings.offset.minus5' },
  { value: '0', label: 'settings.noOffset' },
  { value: '5', label: 'settings.offset.plus5' },
  { value: '10', label: 'settings.offset.plus10' },
  { value: '15', label: 'settings.offset.plus15' },
  { value: '20', label: 'settings.offset.plus20' },
  { value: '25', label: 'settings.offset.plus25' },
  { value: '30', label: 'settings.offset.plus30' },
  { value: '35', label: 'settings.offset.plus35' },
  { value: '40', label: 'settings.offset.plus40' },
  { value: '45', label: 'settings.offset.plus45' },
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
      <Header title="settings.mothSurveySettings" />

      <Main>
        <IonList lines="full">
          <div className="rounded-list">
            <Toggle
              prefix={<IonIcon src={cameraOutline} className="size-6" />}
              label="settings.imageIdentification"
              defaultSelected={useImageIdentifier}
              onChange={onTurnOffImageIdentifierToggle}
            />
            <InfoMessage inline>settings.weWillHelp</InfoMessage>
            <SelectInput
              prefix={<IonIcon icon={moonOutline} className="size-6" />}
              label="settings.sunsetOffset"
              value={`${mothSunsetOffset}`}
              onChange={onSunsetOffsetChange}
              options={SUNSET_OFFSET_OPTIONS}
            />
            <SelectInput
              prefix={<IonIcon icon={sunnyOutline} className="size-6" />}
              label="settings.sunriseOffset"
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
