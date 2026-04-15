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
  timeFormat,
  isValidDate,
} from '@flumens';
import { IonList } from '@ionic/react';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import Group from 'common/models/group';
import locations from 'models/collections/locations';
import Sample from 'models/sample';
import { trapEmptyingTimeAttr, surveyEndDateAttr } from '../config';

type Props = {
  sample: Sample;
  group?: Group;
};

const DetailsMain = ({ sample, group }: Props) => {
  const { url } = useRouteMatch();
  const { surveyStartTime, surveyEndTime } = sample.data;
  const trapEmptyingTime = sample.data[trapEmptyingTimeAttr.id];
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

  const startTimePretty = isValidDate(surveyStartTime!)
    ? timeFormat.format(new Date(surveyStartTime!))
    : surveyStartTime; // remote dates
  const endTimePretty = isValidDate(surveyEndTime!)
    ? timeFormat.format(new Date(surveyEndTime!))
    : surveyEndTime; // remote dates
  const emptyingTimePretty = isValidDate(trapEmptyingTime!)
    ? timeFormat.format(new Date(trapEmptyingTime!))
    : trapEmptyingTime; // remote dates

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${url}/location`}
            icon={mothInsideBoxIcon}
            label="Moth trap"
            skipValueTranslation
            value={locationName}
            disabled={isDisabled}
          />
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
          <MenuAttrItem
            routerLink={`${url}/surveyStartTime`}
            disabled={isDisabled}
            icon={timeOutline}
            label="Time"
            value={startTimePretty}
            skipValueTranslation
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
          <MenuAttrItem
            routerLink={`${url}/surveyEndTime`}
            disabled={isDisabled}
            icon={timeOutline}
            label="Time"
            value={endTimePretty}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${url}/${trapEmptyingTimeAttr.id}`}
            disabled={isDisabled}
            icon={timeOutline}
            label="Emptying time"
            value={emptyingTimePretty}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${url}/endWeather`}
            icon={cloudOutline}
            label="Weather"
            skipValueTranslation
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(DetailsMain);
