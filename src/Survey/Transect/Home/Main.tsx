/* eslint-disable no-return-assign */
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
import { Main, MenuAttrItem } from '@flumens';
import { IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import MenuDateAttr from 'common/Components/MenuDateAttr';
import windIcon from 'common/images/wind.svg';
import locations from 'models/collections/locations';
import Sample from 'models/sample';
import UploadedRecordInfoMessage from 'Survey/common/UploadedRecordInfoMessage';

type Props = {
  sample: Sample;
  isDisabled: boolean;
};

const Edit = ({ sample, isDisabled }: Props) => {
  const getPrettySectionsLabel = () => {
    if (!sample.data.locationId)
      return (
        <IonLabel slot="end" color="danger">
          <T>No transect</T>
        </IonLabel>
      );

    const transect = locations.idMap.get(sample.data.locationId || '');
    const transectName = transect?.data.name || sample.data.locationId; // locationId for remote ones

    return <IonLabel slot="end">{transectName}</IonLabel>;
  };

  const { temperature, cloud, windDirection, windSpeed, recorder, comment } =
    sample.data;

  const baseURL = `/survey/transect/${sample.id || sample.cid}`;

  return (
    <Main id="transect-edit">
      {!!isDisabled && <UploadedRecordInfoMessage sample={sample} />}

      <IonList lines="full">
        <div className="rounded-list">
          <IonItem routerLink={`${baseURL}/sections`} detail>
            <IonIcon icon={mapOutline} slot="start" mode="md" />
            <IonLabel>
              <T>Sections</T>
            </IonLabel>
            {getPrettySectionsLabel()}
          </IonItem>

          <MenuDateAttr
            label="Start Time"
            id="surveyStartTime"
            value={sample.data.surveyStartTime}
            presentation="time"
            onChange={val => (sample.data.surveyStartTime = val)}
            isDisabled={isDisabled}
            icon={timeOutline}
          />

          <MenuDateAttr
            label="End Time"
            id="surveyEndTime"
            value={sample.data.surveyEndTime}
            presentation="time"
            onChange={val => (sample.data.surveyEndTime = val)}
            isDisabled={isDisabled}
            icon={timeOutline}
          />
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
