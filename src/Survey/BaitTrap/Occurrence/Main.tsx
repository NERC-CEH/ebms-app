/* eslint-disable no-param-reassign */
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
  recaptureAttr,
  feedingAttr,
  fateAttr,
  ageAttr,
  wingLengthAttr,
  OccData,
  fieldCodeAttr,
  RECAPTURED,
} from '../config';

type Props = {
  occurrence: Occurrence<OccData>;
};

const OccurrenceMain = ({ occurrence }: Props) => {
  const { url } = useRouteMatch();

  const isDisabled = occurrence.isUploaded;

  const setRecaptureAndResetCode = (value: string) => {
    occurrence.data[recaptureAttr.id] = value;

    if (value === RECAPTURED) {
      occurrence.metadata.speciesCode = occurrence.data[fieldCodeAttr.id];
      occurrence.data[fieldCodeAttr.id] = '';
    } else {
      occurrence.data[fieldCodeAttr.id] = occurrence.metadata.speciesCode || '';
    }
  };

  const isRecaptured = occurrence.data[recaptureAttr.id] === RECAPTURED;

  return (
    <Main className="[--padding-bottom:40px]">
      <BlockContext value={{ isDisabled }}>
        <IonList lines="full">
          <div className="rounded-list">
            <IonItem
              routerLink={!isDisabled ? `${url}/taxon` : undefined}
              className="[--padding-start:5px]"
            >
              <div className="list-avatar my-1 border-neutral-200 border">
                {getSpeciesProfileImage(occurrence.data.taxon)}
              </div>
              <TaxonPrettyName
                {...occurrence.data.taxon}
                className="text-(--form-value-color) my-2 text-right"
              />
            </IonItem>
            <Block
              record={occurrence.data}
              block={recaptureAttr}
              onChange={setRecaptureAndResetCode}
            />
            <Block
              record={occurrence.data}
              block={fieldCodeAttr}
              isDisabled={!isRecaptured}
            />
            <Block record={occurrence.data} block={sexAttr} />
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
