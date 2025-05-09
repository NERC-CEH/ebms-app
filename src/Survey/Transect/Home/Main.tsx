import { observer } from 'mobx-react';
import {
  personOutline,
  mapOutline,
  timeOutline,
  clipboardOutline,
  thermometerOutline,
  cloudyOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { isValidDate, Main, MenuAttrItem, timeFormat } from '@flumens';
import { IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import windIcon from 'common/images/wind.svg';
import Sample from 'models/sample';
import UploadedRecordInfoMessage from 'Survey/common/UploadedRecordInfoMessage';

type Props = {
  sample: Sample;
  isDisabled: boolean;
};

const Edit = ({ sample, isDisabled }: Props) => {
  const getPrettySectionsLabel = () => {
    const transect: any = sample.data.location;
    if (!transect)
      return (
        <IonLabel slot="end" color="danger  ">
          <T>No transect</T>
        </IonLabel>
      );

    const name =
      transect.location?.name ||
      // for remote locations
      transect.name;

    return <IonLabel slot="end">{name}</IonLabel>;
  };

  const {
    temperature,
    cloud,
    windDirection,
    windSpeed,
    recorder,
    comment,
    surveyStartTime,
    surveyEndTime,
  } = sample.data;

  const startTimePretty = isValidDate(surveyStartTime!)
    ? timeFormat.format(new Date(surveyStartTime!))
    : surveyStartTime;

  const endTimePretty = isValidDate(surveyEndTime!)
    ? timeFormat.format(new Date(surveyEndTime!))
    : surveyEndTime;

  const baseURL = `/survey/transect/${sample.id || sample.cid}`;

  const setSurveyEndTimeIfMissing = () => {
    if (!isDisabled && !sample.data.surveyEndTime)
      sample.data.surveyEndTime = new Date().toISOString(); // eslint-disable-line no-param-reassign
  };

  return (
    <Main id="transect-edit">
      {isDisabled && <UploadedRecordInfoMessage sample={sample} />}

      <IonList lines="full">
        <div className="rounded-list">
          <IonItem routerLink={`${baseURL}/sections`} detail>
            <IonIcon icon={mapOutline} slot="start" mode="md" />
            <IonLabel>
              <T>Sections</T>
            </IonLabel>
            {getPrettySectionsLabel()}
          </IonItem>

          <MenuAttrItem
            routerLink={`${baseURL}/surveyStartTime`}
            disabled={isDisabled}
            icon={timeOutline}
            label="Start Time"
            value={startTimePretty}
            skipValueTranslation
          />

          <div onClick={setSurveyEndTimeIfMissing}>
            <MenuAttrItem
              routerLink={`${baseURL}/surveyEndTime`}
              disabled={isDisabled}
              icon={timeOutline}
              label="End Time"
              value={endTimePretty}
              skipValueTranslation
            />
          </div>
        </div>

        <h3 className="list-title">
          <T>Weather</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${baseURL}/temperature`}
            disabled={isDisabled}
            icon={thermometerOutline}
            label="Temperature"
            value={temperature}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon={cloudyOutline}
            label="Cloud"
            value={cloud}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windDirection`}
            disabled={isDisabled}
            icon={windIcon}
            label="Wind Direction"
            value={windDirection}
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windSpeed`}
            disabled={isDisabled}
            icon={windIcon}
            label="Wind Speed"
            value={windSpeed}
          />
        </div>

        <h3 className="list-title">
          <T>Other</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${baseURL}/recorder`}
            disabled={isDisabled}
            icon={personOutline}
            label="Recorder"
            value={recorder}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="Comment"
            value={comment}
            skipValueTranslation
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(Edit);
