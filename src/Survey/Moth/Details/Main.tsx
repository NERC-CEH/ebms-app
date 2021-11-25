import React, { FC } from 'react';
import { Main, MenuAttrItemFromModel, Attr, MenuAttrItem } from '@apps';
import Sample from 'models/sample';
import { IonList, IonLabel } from '@ionic/react';
import { observer } from 'mobx-react';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import { useRouteMatch } from 'react-router';

type Props = {
  sample: typeof Sample;
};

const DetailsMain: FC<Props> = ({ sample }) => {
  const { url } = useRouteMatch();
  const survey = sample.getSurvey();
  const surveyDateProps = survey.attrs.date.pageProps.attrProps.inputProps;
  const isDisabled = sample.isUploaded();

  const valueLatitude =
    sample.attrs.location &&
    parseFloat(sample.attrs.location.latitude).toFixed(3);

  const valueLongitude =
    sample.attrs.location &&
    parseFloat(sample.attrs.location.longitude).toFixed(3);

  const value = sample.attrs.location && (
    <IonLabel position="stacked" mode="ios">
      <IonLabel>Latitude: {valueLatitude}</IonLabel>
      <IonLabel>Longitude: {valueLongitude}</IonLabel>
    </IonLabel>
  );

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${url}/location`}
            icon={mothInsideBoxIcon}
            label="Moth trap"
            disabled={isDisabled}
            skipValueTranslation
            value={value}
          />
          <Attr
            model={sample}
            attr="date"
            input="date"
            inputProps={surveyDateProps}
          />
          <MenuAttrItemFromModel
            model={sample}
            attr="recorder"
            skipTranslation
          />
          <MenuAttrItemFromModel
            model={sample}
            attr="comment"
            skipTranslation
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(DetailsMain);
