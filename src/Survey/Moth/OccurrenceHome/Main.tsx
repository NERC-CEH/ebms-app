import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, MenuAttrItem, MenuAttrItemFromModel, Attr } from '@flumens';
import { IonIcon, IonList } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import mothOutsideBoxIcon from 'common/images/moth-outside-icon.svg';
import mothIcon from 'common/images/moth.svg';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';

interface Props {
  occurrence: Occurrence;
}

const EditOccurrence = ({ occurrence }: Props) => {
  const { useImageIdentifier } = appModel.attrs;
  const match = useRouteMatch();
  const species = occurrence.getTaxonCommonAndScientificNames();
  const isDisabled = occurrence.isDisabled();
  const baseURL = match.url;

  return (
    <Main id="moth-occurrence-edit">
      <IonList lines="full">
        <h3 className="list-title">
          <T>Details</T>
        </h3>
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${baseURL}/taxon`}
            disabled={isDisabled}
            icon={mothIcon}
            label="Species"
            value={<TaxonPrettyName name={species} />}
            skipValueTranslation
            className="taxon-entry"
          />
          <Attr
            model={occurrence}
            input="counter"
            inputProps={{
              prefix: <IonIcon src={mothInsideBoxIcon} className="size-6" />,
              label: 'Count inside',
              isDisabled,
              min: 0,
            }}
            attr="count"
          />

          <Attr
            model={occurrence}
            input="counter"
            inputProps={{
              prefix: <IonIcon src={mothOutsideBoxIcon} className="size-6" />,
              label: 'Count outside',
              isDisabled,
              min: 0,
            }}
            attr="count-outside"
          />

          <MenuAttrItemFromModel
            model={occurrence}
            attr="identifier"
            skipValueTranslation
          />
          <MenuAttrItemFromModel
            model={occurrence}
            attr="comment"
            skipValueTranslation
          />
        </div>

        <h3 className="list-title">
          <T>Moth Photos</T>
        </h3>
        <div className="rounded-list">
          <PhotoPicker
            model={occurrence}
            useImageIdentifier={useImageIdentifier}
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditOccurrence);
