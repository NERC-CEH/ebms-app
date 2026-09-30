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
import { Badge, Main, MenuAttrItem } from '@flumens';
import { IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import MenuDateAttr from 'common/Components/MenuDateAttr';
import windIcon from 'common/images/wind.svg';
import locations from 'models/collections/locations';
import Sample from 'models/sample';
import ProjectMenuItem from 'Survey/common/ProjectMenuItem';
import UploadedRecordInfoMessage from 'Survey/common/UploadedRecordInfoMessage';

type Props = {
  sample: Sample;
  isDisabled: boolean;
};

const Edit = ({ sample, isDisabled }: Props) => {
  const getPrettyTransectLabel = () => {
    if (!sample.data.locationId)
      return <Badge color="warning">transect.noTransect</Badge>;

    const transect = locations.idMap.get(sample.data.locationId || '');
    const transectName = transect?.data.name || sample.data.locationId; // locationId for remote ones

    return <IonLabel slot="end">{transectName}</IonLabel>;
  };

  const { temperature, cloud, windDirection, windSpeed, recorder, comment } =
    sample.data;

  const baseURL = `/survey/transect/${sample.id || sample.cid}`;

  return (
    <Main id="transect-edit" className="pb-ion-s-10">
      {!!isDisabled && <UploadedRecordInfoMessage sample={sample} />}

      <IonList lines="full">
        <div className="rounded-list">
          <IonItem
            routerLink={
              !isDisabled && !sample.data.locationId
                ? `${baseURL}/location`
                : undefined
            }
            detail={false}
          >
            <IonIcon icon={mapOutline} slot="start" mode="md" />
            <IonLabel>
              <T>transect.transect</T>
            </IonLabel>
            {getPrettyTransectLabel()}
          </IonItem>

          {!!sample.data.locationId && (
            <IonItem routerLink={`${baseURL}/sections`}>
              <IonIcon icon={mapOutline} slot="start" mode="md" />
              <IonLabel>
                <T>transect.sections</T>
              </IonLabel>

              <IonLabel slot="end">{sample.samples.length}</IonLabel>
            </IonItem>
          )}

          <MenuDateAttr
            label="common.startTime"
            id="surveyStartTime"
            value={sample.data.surveyStartTime}
            presentation="time"
            onChange={val => (sample.data.surveyStartTime = val)}
            isDisabled={isDisabled}
            icon={timeOutline}
          />

          <MenuDateAttr
            label="common.endTime"
            id="surveyEndTime"
            value={sample.data.surveyEndTime}
            presentation="time"
            onChange={val => (sample.data.surveyEndTime = val)}
            isDisabled={isDisabled}
            icon={timeOutline}
          />
        </div>

        <h3 className="list-title">
          <T>common.weather</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${baseURL}/temperature`}
            disabled={isDisabled}
            icon={thermometerOutline}
            label="common.temperature"
            value={temperature}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon={cloudyOutline}
            label="common.cloud"
            value={cloud}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windDirection`}
            disabled={isDisabled}
            icon={windIcon}
            label="common.windDirection"
            value={windDirection}
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windSpeed`}
            disabled={isDisabled}
            icon={windIcon}
            label="common.windSpeed"
            value={windSpeed}
          />
        </div>

        <h3 className="list-title">
          <T>common.other</T>
        </h3>
        <div className="rounded-list">
          <ProjectMenuItem
            isDisabled={isDisabled}
            groupId={sample.data.groupId}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/recorder`}
            disabled={isDisabled}
            icon={personOutline}
            label="common.recorder"
            value={recorder}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="common.comment"
            value={comment}
            skipValueTranslation
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(Edit);
