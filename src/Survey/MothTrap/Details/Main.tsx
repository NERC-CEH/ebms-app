import { observer } from 'mobx-react';
import { timeOutline, cloudOutline, peopleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Main,
  MenuAttrItemFromModel,
  Attr,
  MenuAttrItem,
  AttrPropsExtended,
  Block,
} from '@flumens';
import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/react';
import MenuDateAttr from 'common/Components/MenuDateAttr';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import Group from 'common/models/group';
import locations from 'models/collections/locations';
import Sample from 'models/sample';
import {
  trapEmptyingTimeAttr,
  surveyEndDateAttr,
  useTemporarySiteAttr,
} from '../config';

type Props = {
  sample: Sample;
  group?: Group;
  onOpenTemporaryTrapModal: () => void;
  onChangeSiteType: (value: boolean) => void;
};

const DetailsMain = ({
  sample,
  group,
  onChangeSiteType,
  onOpenTemporaryTrapModal,
}: Props) => {
  const { url } = useRouteMatch();
  const location = locations.idMap.get(sample.data.locationId || '');
  const survey = sample.getSurvey();

  const dateAttrProps = survey.attrs!.date.pageProps!
    .attrProps as AttrPropsExtended;
  const surveyDateProps = dateAttrProps.inputProps();

  const surveyEndDateAttrProps = survey.attrs![surveyEndDateAttr.id].pageProps!
    .attrProps as AttrPropsExtended;
  const surveyEndDateProps = surveyEndDateAttrProps.inputProps();

  const isDisabled = sample.isUploaded;

  const locationName = location?.data?.name ?? null;

  const isUsingTemporarySite = sample.metadata[useTemporarySiteAttr.id];
  const temporaryTrapName = sample.data.locationName;

  const openTemporaryTrapModal = () =>
    !isDisabled && onOpenTemporaryTrapModal();

  return (
    <Main className="[--padding-bottom:40px]">
      <IonList lines="full">
        <h3 className="list-title">
          <T>Trap</T>
        </h3>
        <div className="rounded-list">
          {!isUsingTemporarySite && (
            <MenuAttrItem
              routerLink={`${url}/trap`}
              icon={mothInsideBoxIcon}
              label="Moth trap"
              skipValueTranslation
              value={locationName}
              disabled={isDisabled}
            />
          )}
          {isUsingTemporarySite && (
            <IonItem detail onClick={openTemporaryTrapModal}>
              <IonIcon slot="start" src={mothInsideBoxIcon} />
              <IonLabel>
                <T>Moth trap</T>
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
          <T>Trap start</T>
        </h3>
        <div className="rounded-list">
          <Attr
            model={sample}
            attr="date"
            input="date"
            inputProps={{ ...surveyDateProps, disabled: isDisabled }}
          />
          <MenuDateAttr
            label="Time"
            value={sample.data.surveyStartTime}
            presentation="time"
            onChange={val => (sample.data.surveyStartTime = val)} // eslint-disable-line no-return-assign, no-param-reassign
            isDisabled={isDisabled}
            icon={timeOutline}
          />
          <MenuAttrItem
            routerLink={`${url}/startWeather`}
            icon={cloudOutline}
            label="Weather"
            skipValueTranslation
          />
        </div>
      </IonList>

      <IonList lines="full">
        <h3 className="list-title">
          <T>Trap end</T>
        </h3>
        <div className="rounded-list">
          <Attr
            model={sample}
            attr={surveyEndDateAttr.id}
            input="date"
            inputProps={{ ...surveyEndDateProps, disabled: isDisabled }}
          />
          <MenuDateAttr
            label="Time"
            value={sample.data.surveyEndTime}
            presentation="time"
            onChange={val => (sample.data.surveyEndTime = val)} // eslint-disable-line no-return-assign, no-param-reassign
            isDisabled={isDisabled}
            icon={timeOutline}
          />
          <MenuDateAttr
            label="Emptying time"
            value={sample.data[trapEmptyingTimeAttr.id]}
            presentation="time"
            onChange={val => (sample.data[trapEmptyingTimeAttr.id] = val)} // eslint-disable-line no-return-assign, no-param-reassign
            isDisabled={isDisabled}
            icon={timeOutline}
          />

          <MenuAttrItem
            routerLink={`${url}/endWeather`}
            icon={cloudOutline}
            label="Weather"
            skipValueTranslation
          />
        </div>
      </IonList>

      <IonList lines="full">
        <h3 className="list-title">
          <T>Other</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${url}/group`}
            disabled={isDisabled}
            icon={peopleOutline}
            label="Project"
            value={group?.data.title}
            skipValueTranslation
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
