import React, { FC } from 'react';
import { Main, MenuAttrItemFromModel, Attr, MenuAttrItem } from '@apps';
import Sample from 'models/sample';
import { IonList, IonItemDivider } from '@ionic/react';
import { observer } from 'mobx-react';
import { mapOutline } from 'ionicons/icons';
import { useRouteMatch } from 'react-router';

type Props = {
  sample: typeof Sample;
};

const DetailsMain: FC<Props> = ({ sample }) => {
  const { url } = useRouteMatch();
  const survey = sample.getSurvey();
  const surveyDateProps = survey.attrs.date.pageProps.attrProps.inputProps;
  const isDisabled = sample.isUploaded();

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${url}/location`}
            icon={mapOutline}
            label="Location"
            disabled={isDisabled}
            skipValueTranslation
          />

          <Attr
            model={sample}
            attr="date"
            input="date"
            inputProps={surveyDateProps}
          />
        </div>

        <IonItemDivider>Details</IonItemDivider>
        <div className="rounded">
          <MenuAttrItemFromModel model={sample} attr="method" />
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
