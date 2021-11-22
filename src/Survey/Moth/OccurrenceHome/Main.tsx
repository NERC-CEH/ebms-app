import React, { FC } from 'react';
import { IonList, IonItemDivider } from '@ionic/react';
import config from 'common/config/config';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import ImageModel from 'common/models/media';
import { Trans as T } from 'react-i18next';
import {
  Main,
  MenuAttrItem,
  PhotoPicker,
  MenuAttrItemFromModel,
  Attr,
} from '@apps';
import mothIcon from 'common/images/moth.svg';
import { useRouteMatch } from 'react-router';
import mothOutsideBoxIcon from './images/moth-outside-icon.svg';
import mothInsideBoxIcon from './images/moth-inside-icon.svg';

interface Props {
  occurrence: typeof Occurrence;
}

const EditOccurrence: FC<Props> = ({ occurrence }) => {
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
              min: 1,
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
          <T>Moth Photo</T>
        </IonItemDivider>
        <div className="rounded">
          <PhotoPicker
            model={occurrence}
            isDisabled={isDisabled}
            dataDirPath={config.dataPath}
            ImageClass={ImageModel}
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditOccurrence);
