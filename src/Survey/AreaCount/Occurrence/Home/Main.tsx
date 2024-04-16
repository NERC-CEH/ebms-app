import { FC } from 'react';
import { observer } from 'mobx-react';
import {
  clipboardOutline,
  locationOutline,
  warningOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, MenuAttrItem } from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import caterpillarIcon from 'common/images/caterpillar.svg';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import GridRefValue from 'Components/GridRefValue';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import PaintedLadyAttrs from './PaintedLadyAttrs';
import './styles.scss';

type Props = {
  subSample: Sample;
  occurrence: Occurrence;
  isDisabled: boolean;
};

const EditOccurrence: FC<Props> = ({ subSample, occurrence, isDisabled }) => {
  const match = useRouteMatch();

  const species = occurrence.getTaxonCommonAndScientificNames();
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
        <h3 className="list-title">
          <T>Details</T>
        </h3>
        <div className="rounded-list">
          {!isPreciseSurvey && (
            <MenuAttrItem
              routerLink={`${baseURL}/taxon`}
              disabled={isDisabled}
              icon={occurrence.getSpeciesGroupIcon()}
              label="Species"
              value={<TaxonPrettyName name={species} />}
              skipValueTranslation
              className="taxon-entry"
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
