import { observer } from 'mobx-react';
import {
  clipboardOutline,
  locationOutline,
  warningOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, MenuAttrItem } from '@flumens';
import { IonList, IonIcon, IonItem } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import { getSpeciesProfileImage } from 'common/data/profiles';
import caterpillarIcon from 'common/images/caterpillar.svg';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import PrettyLocation from 'Components/PrettyLocation';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import PaintedLadyAttrs from './PaintedLadyAttrs';
import './styles.scss';

type Props = {
  subSample: Sample;
  occurrence: Occurrence;
  isDisabled: boolean;
};

const EditOccurrence = ({ subSample, occurrence, isDisabled }: Props) => {
  const match = useRouteMatch();

  const { dragonflyStage, stage, comment } = occurrence.data;

  const isDragonfly = occurrence.isDragonflyTaxon();

  const baseURL = match.url;
  const isPreciseSurvey = subSample.isSurveyPreciseSingleSpecies();

  const sampleBaseUrl = baseURL.split('/occ');
  sampleBaseUrl.pop();

  let location;
  if (subSample.hasLoctionMissingAndIsnotLocating()) {
    if (!isDisabled)
      location = <IonIcon icon={warningOutline} color="danger" />;
  } else {
    location = <PrettyLocation sample={subSample} />;
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
          )}
          <MenuAttrItem
            routerLink={`${sampleBaseUrl}/location`}
            disabled={isDisabled}
            icon={locationOutline}
            label="Location"
            value={location}
            skipValueTranslation
          />

          {!isDragonfly && (
            <MenuAttrItem
              routerLink={`${baseURL}/stage`}
              disabled={isDisabled}
              icon={caterpillarIcon}
              label="Stage"
              value={stage}
            />
          )}

          {isDragonfly && (
            <MenuAttrItem
              routerLink={`${baseURL}/dragonflyStage`}
              disabled={isDisabled}
              icon={caterpillarIcon}
              label="Stage"
              value={dragonflyStage}
            />
          )}

          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="Comment"
            value={comment}
          />
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
