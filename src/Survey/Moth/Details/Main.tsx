import { FC } from 'react';
import { observer } from 'mobx-react';
import { timeOutline, cloudOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Main,
  MenuAttrItemFromModel,
  Attr,
  MenuAttrItem,
  AttrPropsExtended,
} from '@flumens';
import { IonList } from '@ionic/react';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import Sample, { MothTrapLocation } from 'models/sample';

type Props = {
  sample: Sample;
};

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

const DetailsMain: FC<Props> = ({ sample }) => {
  const { url } = useRouteMatch();
  const { surveyStartTime, surveyEndTime } = sample.attrs;
  const location = sample.attrs.location as MothTrapLocation;
  const survey = sample.getSurvey();

  const dateAttrProps = survey.attrs!.date!.pageProps!
    .attrProps as AttrPropsExtended;
  const surveyDateProps = dateAttrProps.inputProps();

  const isDisabled = sample.isUploaded();

  // TODO: Backwards compatibility
  const locationNameSupportedBackwardsCompatibility =
    location?.name || location?.attrs?.location?.name;

  const locationName = location
    ? locationNameSupportedBackwardsCompatibility
    : null;

  const startTimePretty =
    surveyStartTime && dateTimeFormat.format(new Date(surveyStartTime));
  const endTimePretty =
    surveyEndTime && dateTimeFormat.format(new Date(surveyEndTime));

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
          <Attr
            model={sample}
            attr="date"
            input="date"
            inputProps={{ ...surveyDateProps, disabled: isDisabled }}
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

      <h3 className="list-title">
        <T>Trap start</T>
      </h3>
      <IonList lines="full">
        <div className="rounded-list">
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

      <h3 className="list-title">
        <T>Trap end</T>
      </h3>
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${url}/surveyEndTime`}
            disabled={isDisabled}
            icon={timeOutline}
            label="Time"
            value={endTimePretty}
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
