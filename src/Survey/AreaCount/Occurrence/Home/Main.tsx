import { observer } from 'mobx-react';
import { locationOutline, warningOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Block, isValidLocation, Main, MenuAttrItem } from '@flumens';
import { IonList, IonIcon, IonItem } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import { getSpeciesProfileImage } from 'common/data/profiles';
import caterpillarIcon from 'common/images/caterpillar.svg';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import PrettyLocation from 'Components/PrettyLocation';
import AttrLock from 'Survey/common/AttrLock';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import { commentAttr } from 'Survey/common/config';
import PaintedLadyAttrs from './PaintedLadyAttrs';
import './styles.scss';

type Props = {
  sample: Sample;
  subSample: Sample;
  occurrence: Occurrence;
  isDisabled: boolean;
};

const EditOccurrence = ({
  sample,
  subSample,
  occurrence,
  isDisabled,
}: Props) => {
  const match = useRouteMatch();

  const { dragonflyStage, stage, comment, taxon } = occurrence.data;
  const taxonGroup = taxon.taxonGroupId;

  const isDragonfly = occurrence.isDragonflyTaxon();

  const baseURL = match.url;
  const isPreciseSurvey = subSample.isSurveyPreciseSingleSpecies();

  const sampleBaseUrl = baseURL.split('/occ');
  sampleBaseUrl.pop();

  const { location } = subSample.data;
  let locationPretty;
  if (subSample.hasNoLocationAndNotLocating()) {
    if (!isDisabled)
      locationPretty = <IonIcon icon={warningOutline} color="danger" />;
  } else {
    locationPretty = <PrettyLocation sample={subSample} />;
  }

  const speciesName = occurrence.getTaxonName();

  const isPaintedLadySurvey = subSample.isPaintedLadySurvey();

  return (
    <Main id="area-count-occurrence-edit">
      <IonList lines="full">
        <h3 className="list-title">
          <T>Details</T>
        </h3>
        <div className="rounded-list">
          {!isPreciseSurvey && (
            <IonItem
              routerLink={!isDisabled ? `${baseURL}/taxon` : undefined}
              className="[--padding-start:5px]"
              detail={!isDisabled}
            >
              <div className="list-avatar my-1 border-neutral-200 border">
                {getSpeciesProfileImage(occurrence.data.taxon)}
              </div>
              <TaxonPrettyName
                {...occurrence.data.taxon}
                className="text-(--form-value-color) my-2 text-right"
              />
            </IonItem>
          )}
          <AttrLock
            sample={sample}
            taxonGroup="all"
            model="smp"
            attr="location"
            value={isValidLocation(location) ? location : null}
          >
            <MenuAttrItem
              routerLink={`${sampleBaseUrl}/location`}
              disabled={isDisabled}
              icon={locationOutline}
              label="Location"
              value={locationPretty}
              skipValueTranslation
            />
          </AttrLock>

          {!isDragonfly && (
            <AttrLock
              sample={sample}
              taxonGroup={taxonGroup}
              model="occ"
              attr="stage"
              value={stage}
            >
              <MenuAttrItem
                routerLink={`${baseURL}/stage`}
                disabled={isDisabled}
                icon={caterpillarIcon}
                label="Stage"
                value={stage}
              />
            </AttrLock>
          )}

          {isDragonfly && (
            <AttrLock
              sample={sample}
              taxonGroup={taxonGroup}
              model="occ"
              attr="dragonflyStage"
              value={dragonflyStage}
            >
              <MenuAttrItem
                routerLink={`${baseURL}/dragonflyStage`}
                disabled={isDisabled}
                icon={caterpillarIcon}
                label="Stage"
                value={dragonflyStage}
              />
            </AttrLock>
          )}

          <AttrLock
            sample={sample}
            taxonGroup="all"
            model="occ"
            attr="comment"
            value={comment}
          >
            <Block
              block={commentAttr}
              record={occurrence.data}
              isDisabled={occurrence.isDisabled}
            />
          </AttrLock>
        </div>

        {isPaintedLadySurvey && (
          <>
            <h3 className="list-title">
              <T>{speciesName}</T>
            </h3>
            <div className="rounded-list">
              <PaintedLadyAttrs occurrence={occurrence} />
            </div>
          </>
        )}

        <h3 className="list-title">
          <T>Species Photo</T>
        </h3>
        <div className="rounded-list">
          <PhotoPicker model={occurrence} />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditOccurrence);
