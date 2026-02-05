import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, MenuAttrItemFromModel, Attr } from '@flumens';
import { IonIcon, IonItem, IonList } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import { getSpeciesProfileImage } from 'common/data/profiles';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';
import mothOutsideBoxIcon from 'common/images/moth-outside-icon.svg';
import appModel from 'models/app';
import Occurrence from 'models/occurrence';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';

type Props = {
  occurrence: Occurrence;
};

const EditOccurrence = ({ occurrence }: Props) => {
  const { useImageIdentifier } = appModel.data;
  const match = useRouteMatch();
  const { isDisabled } = occurrence;
  const baseURL = match.url;

  return (
    <Main id="moth-occurrence-edit">
      <IonList lines="full">
        <h3 className="list-title">
          <T>Details</T>
        </h3>
        <div className="rounded-list">
          <IonItem
            routerLink={`${baseURL}/taxon`}
            disabled={isDisabled}
            className="[--padding-start:5px]"
          >
            <div className="list-avatar my-1 border-neutral-200 border">
              {getSpeciesProfileImage(occurrence.data.taxon)}
            </div>
            <TaxonPrettyName
              taxon={occurrence.data.taxon}
              className="text-(--form-value-color) my-2 text-right"
            />
          </IonItem>
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
