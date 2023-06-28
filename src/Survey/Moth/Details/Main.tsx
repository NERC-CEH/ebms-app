import { FC } from 'react';
import {
  Main,
  MenuAttrItemFromModel,
  Attr,
  MenuAttrItem,
  AttrPropsExtended,
} from '@flumens';
import { Trans as T } from 'react-i18next';
import Sample from 'models/sample';
import { IonList, IonItemDivider } from '@ionic/react';
import { observer } from 'mobx-react';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import { useRouteMatch } from 'react-router';
import { timeOutline, cloudOutline } from 'ionicons/icons';

type Props = {
  sample: Sample;
};

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

const DetailsMain: FC<Props> = ({ sample }) => {
  const { url } = useRouteMatch();
  const { location, surveyStartTime, surveyEndTime } = sample.attrs;
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
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${url}/location`}
            icon={mothInsideBoxIcon}
            label="Moth trap"
            skipValueTranslation
            value={locationName}
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

      <IonItemDivider>
        <T>Trap start</T>
      </IonItemDivider>
      <IonList lines="full">
        <div className="rounded">
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
            disabled={isDisabled}
            icon={cloudOutline}
            label="Weather"
            skipValueTranslation
          />
        </div>
      </IonList>

      <IonItemDivider>
        <T>Trap end</T>
      </IonItemDivider>
      <IonList lines="full">
        <div className="rounded">
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
            disabled={isDisabled}
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
