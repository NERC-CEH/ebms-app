import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, Block, MenuAttrItemFromModel, BlockContext } from '@flumens';
import { IonItem, IonList } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import { getSpeciesProfileImage } from 'common/data/profiles';
import Occurrence from 'models/occurrence';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import {
  sexAttr,
  markedAttr,
  recaptureAttr,
  feedingAttr,
  fateAttr,
  ageAttr,
  wingLengthAttr,
  OccData,
} from '../config';

type Props = {
  occurrence: Occurrence<OccData>;
};

const OccurrenceMain = ({ occurrence }: Props) => {
  const { url } = useRouteMatch();

  const isDisabled = occurrence.isUploaded;

  return (
    <Main>
      <BlockContext value={{ isDisabled }}>
        <IonList lines="full">
          <div className="rounded-list">
            <IonItem
              routerLink={`${url}/taxon`}
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
            <Block record={occurrence.data} block={sexAttr} />
            <Block record={occurrence.data} block={markedAttr} />
            <Block record={occurrence.data} block={recaptureAttr} />
            <Block record={occurrence.data} block={fateAttr} />
            <Block record={occurrence.data} block={ageAttr} />
            <Block record={occurrence.data} block={wingLengthAttr} />
            <Block record={occurrence.data} block={feedingAttr} />
            <MenuAttrItemFromModel
              model={occurrence}
              attr="comment"
              skipValueTranslation
            />
          </div>
        </IonList>

        <IonList lines="full">
          <h3 className="list-title">
            <T>Species photos</T>
          </h3>
          <div className="rounded-list">
            <PhotoPicker model={occurrence} />
          </div>
        </IonList>
      </BlockContext>
    </Main>
  );
};

export default observer(OccurrenceMain);
