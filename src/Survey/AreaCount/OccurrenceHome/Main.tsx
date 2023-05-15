import { FC } from 'react';
import { IonList, IonIcon, IonItemDivider } from '@ionic/react';
import { useRouteMatch } from 'react-router';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import {
  clipboardOutline,
  locationOutline,
  warningOutline,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import PhotoPicker from 'common/Components/PhotoPicker';

import { Main, MenuAttrItem } from '@flumens';
import GridRefValue from 'Components/GridRefValue';
import caterpillarIcon from 'common/images/caterpillar.svg';
import PaintedLadyAttrs from './Components/PaintedLadyAttrs';
import './styles.scss';

type Props = {
  subSample: Sample;
  occurrence: Occurrence;
  isDisabled: boolean;
};

const EditOccurrence: FC<Props> = ({ subSample, occurrence, isDisabled }) => {
  const match = useRouteMatch();

  const species = occurrence.getTaxonName();
  const { dragonflyStage, stage, comment } = occurrence.attrs;

  const isDragonfly = occurrence.isDragonflyTaxon();

  const baseURL = match.url;
  const isPreciseSurvey = subSample.isSurveyPreciseSingleSpecies();

  const sampleBaseUrl = baseURL.split('/occ');
  sampleBaseUrl.pop();

  let location;
  if (subSample.hasLoctionMissingAndIsnotLocating()) {
    location = <IonIcon icon={warningOutline} color="danger" />;
  } else {
    location = <GridRefValue sample={subSample} />;
  }

  const speciesName = occurrence.getTaxonName();

  const isPaintedLadySurvey = subSample.isPaintedLadySurvey();

  return (
    <Main id="area-count-occurrence-edit">
      <IonList lines="full">
        <IonItemDivider>
          <T>Details</T>
        </IonItemDivider>
        <div className="rounded">
          {!isPreciseSurvey && (
            <MenuAttrItem
              routerLink={`${baseURL}/taxon`}
              disabled={isDisabled}
              icon={occurrence.getSpeciesGroupIcon()}
              label="Species"
              value={species}
            />
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
            <IonItemDivider>
              <T>{speciesName}</T>
            </IonItemDivider>
            <div className="rounded">
              <PaintedLadyAttrs occurrence={occurrence} />
            </div>
          </>
        )}

        <IonItemDivider>
          <T>Species Photo</T>
        </IonItemDivider>
        <div className="rounded">
          <PhotoPicker model={occurrence} />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditOccurrence);
