/* eslint-disable no-return-assign */
import { observer } from 'mobx-react';
import { timeOutline, cloudOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, MenuAttrItemFromModel, MenuAttrItem, Block } from '@flumens';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/react';
import MenuDateAttr from 'common/Components/MenuDateAttr';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import locations from 'models/collections/locations';
import Sample from 'models/sample';
import ProjectMenuItem from 'Survey/common/ProjectMenuItem';
import {
  trapEmptyingTimeAttr,
  surveyEndDateAttr,
  useTemporarySiteAttr,
} from '../config';

type Props = {
  sample: Sample;
  onOpenTemporaryTrapModal: () => void;
  onChangeSiteType: (value: boolean) => void;
};

const DetailsMain = ({
  sample,
  onChangeSiteType,
  onOpenTemporaryTrapModal,
}: Props) => {
  const { url } = useRouteMatch();
  const location = locations.idMap.get(sample.data.locationId || '');

  const isDisabled = sample.isUploaded;

  const locationName = location?.data?.name ?? null;

  const isUsingTemporarySite = sample.metadata[useTemporarySiteAttr.id];
  const temporaryTrapName = sample.data.locationName;

  const openTemporaryTrapModal = () =>
    !isDisabled && onOpenTemporaryTrapModal();

  return (
    <Main className="pb-ion-s-10">
      <IonList lines="full">
        <h3 className="list-title">
          <T>common.trap</T>
        </h3>
        <div className="rounded-list">
          {!isUsingTemporarySite && (
            <MenuAttrItem
              routerLink={`${url}/trap`}
              icon={mothInsideBoxIcon}
              label="common.mothTrap"
              skipValueTranslation
              value={locationName}
              disabled={isDisabled}
            />
          )}
          {isUsingTemporarySite && (
            <IonItem detail onClick={openTemporaryTrapModal}>
              <IonIcon slot="start" src={mothInsideBoxIcon} />
              <IonLabel>
                <T>common.mothTrap</T>
              </IonLabel>
              <IonLabel slot="end" className="max-w-1/3 truncate">
                {temporaryTrapName}
              </IonLabel>
            </IonItem>
          )}
          <Block
            record={sample.metadata}
            block={useTemporarySiteAttr}
            onChange={onChangeSiteType}
            isDisabled={isDisabled}
          />
        </div>
      </IonList>

      <IonList lines="full">
        <h3 className="list-title">
          <T>moth.trapStart</T>
        </h3>
        <div className="rounded-list">
          <MenuDateAttr
            label="common.date"
            value={sample.data.date}
            onChange={val => (sample.data.date = val)}
            isDisabled={isDisabled}
          />

          <MenuDateAttr
            label="common.time"
            id="surveyStartTime"
            value={sample.data.surveyStartTime}
            presentation="time"
            onChange={val => (sample.data.surveyStartTime = val)}
            isDisabled={isDisabled}
            icon={timeOutline}
          />
          <MenuAttrItem
            routerLink={`${url}/startWeather`}
            icon={cloudOutline}
            label="common.weather"
            skipValueTranslation
          />
        </div>
      </IonList>

      <IonList lines="full">
        <h3 className="list-title">
          <T>moth.trapEnd</T>
        </h3>
        <div className="rounded-list">
          <MenuDateAttr
            label="common.date"
            id="trapEndDate" // needed for datepicker to work
            value={sample.data[surveyEndDateAttr.id]}
            onChange={val => (sample.data[surveyEndDateAttr.id] = val)}
            isDisabled={isDisabled}
          />
          <MenuDateAttr
            label="common.time"
            id="surveyEndTime"
            value={sample.data.surveyEndTime}
            presentation="time"
            onChange={val => (sample.data.surveyEndTime = val)}
            isDisabled={isDisabled}
            icon={timeOutline}
          />
          <MenuDateAttr
            label="moth.emptyingTime"
            value={sample.data[trapEmptyingTimeAttr.id]}
            presentation="time"
            onChange={val => (sample.data[trapEmptyingTimeAttr.id] = val)}
            isDisabled={isDisabled}
            icon={timeOutline}
          />

          <MenuAttrItem
            routerLink={`${url}/endWeather`}
            icon={cloudOutline}
            label="common.weather"
            skipValueTranslation
          />
        </div>
      </IonList>

      <IonList lines="full">
        <h3 className="list-title">
          <T>common.other</T>
        </h3>
        <div className="rounded-list">
          <ProjectMenuItem
            isDisabled={isDisabled}
            groupId={sample.data.groupId}
          />
          <MenuAttrItemFromModel
            model={sample}
            attr="recorder"
            skipValueTranslation
          />

          <MenuAttrItemFromModel
            model={sample}
            attr="comment"
            skipValueTranslation
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(DetailsMain);
