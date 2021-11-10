import React, { FC } from 'react';
import { IonList, IonItemDivider } from '@ionic/react';
import config from 'common/config/config';
import { observer } from 'mobx-react';
import Occurrence from 'models/occurrence';
import ImageModel from 'common/models/media';
import { Trans as T } from 'react-i18next';
import { Main, MenuAttrItem, PhotoPicker, MenuAttrItemFromModel } from '@apps';
import mothIcon from 'common/images/moth.svg';
import { useRouteMatch } from 'react-router';

interface Props {
  occurrence: typeof Occurrence;
}

const EditOccurrence: FC<Props> = ({ occurrence }) => {
  const { dataPath }: any = config;
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
          <T>Species Photo</T>
        </IonItemDivider>
        <div className="rounded">
          <PhotoPicker
            model={occurrence}
            isDisabled={isDisabled}
            dataDirPath={dataPath}
            ImageClass={ImageModel}
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditOccurrence);
