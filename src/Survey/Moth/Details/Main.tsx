import { FC } from 'react';
import { Main, MenuAttrItemFromModel, Attr, MenuAttrItem } from '@flumens';
import Sample from 'models/sample';
import { IonList } from '@ionic/react';
import { observer } from 'mobx-react';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import { useRouteMatch } from 'react-router';

type Props = {
  sample: Sample;
};

const DetailsMain: FC<Props> = ({ sample }) => {
  const { url } = useRouteMatch();
  const { location } = sample.attrs;
  const survey = sample.getSurvey();
  const surveyDateProps = survey.attrs.date.pageProps.attrProps.inputProps();
  const isDisabled = sample.isUploaded();

  // TODO: Backwards compatibility
  const locationNameSupportedBackwardsCompatibility =
    location?.name || location?.attrs?.location?.name;

  const locationName = location
    ? locationNameSupportedBackwardsCompatibility
    : null;

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
