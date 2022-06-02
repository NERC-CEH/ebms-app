import { FC } from 'react';
import { IonList, IonItemDivider } from '@ionic/react';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import appModel from 'models/app';
import { Trans as T } from 'react-i18next';
import { Main, MenuAttrItem, MenuAttrItemFromModel, Attr } from '@flumens';
import PhotoPicker from 'common/Components/PhotoPicker';
import mothIcon from 'common/images/moth.svg';
import { useRouteMatch } from 'react-router';
import mothOutsideBoxIcon from 'common/images/moth-outside-icon.svg';
import mothInsideBoxIcon from 'common/images/moth-inside-icon.svg';

interface Props {
  occurrence: Occurrence;
}

const EditOccurrence: FC<Props> = ({ occurrence }) => {
  const { useImageIdentifier } = appModel.attrs;
  const match = useRouteMatch();
  const species = occurrence.getTaxonName();
  const isDisabled = occurrence.isDisabled();
  const baseURL = match.url;

  return (
    <Main id="area-count-occurrence-edit">
      <IonList lines="full">
        <IonItemDivider>
          <T>Details</T>
        </IonItemDivider>
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${baseURL}/taxon`}
            disabled={isDisabled}
            icon={mothIcon}
            label="Species"
            value={species}
            skipValueTranslation
          />
          <Attr
            model={occurrence}
            input="counter"
            inputProps={{
              icon: mothInsideBoxIcon,
              label: 'Count inside',
              isDisabled,
              min: 1,
            }}
            attr="count"
          />

          <Attr
            model={occurrence}
            input="counter"
            inputProps={{
              icon: mothOutsideBoxIcon,
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

        <IonItemDivider>
          <T>Moth Photos</T>
        </IonItemDivider>
        <div className="rounded">
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
