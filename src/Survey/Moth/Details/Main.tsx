import React, { FC } from 'react';
import { Main, MenuAttrItemFromModel, Attr, MenuAttrItem } from '@apps';
import Sample from 'models/sample';
import { IonList } from '@ionic/react';
import { observer } from 'mobx-react';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import { useRouteMatch } from 'react-router';

type Props = {
  sample: typeof Sample;
};

const DetailsMain: FC<Props> = ({ sample }) => {
  const { url } = useRouteMatch();
  const { location } = sample.attrs;
  const survey = sample.getSurvey();
  const surveyDateProps = survey.attrs.date.pageProps.attrProps.inputProps;
  const isDisabled = sample.isUploaded();

  const locationName = location ? location.attrs?.location?.name : null;

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
    </Main>
  );
};

export default observer(DetailsMain);
