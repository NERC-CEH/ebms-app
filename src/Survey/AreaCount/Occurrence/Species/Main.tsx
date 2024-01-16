import { FC } from 'react';
import { observer } from 'mobx-react';
import { warningOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, MenuAttrItem, InfoBackgroundMessage } from '@flumens';
import {
  IonList,
  IonItem,
  IonLabel,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonItemDivider,
  IonBadge,
  IonIcon,
} from '@ionic/react';
import Sample from 'models/sample';
import GridRefValue from 'Components/GridRefValue';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import './styles.scss';

type Props = {
  samples: Sample[];
  navigateToOccurrence: (smp: Sample) => void;
  deleteSample: (smp: Sample) => void;
  isDisabled?: boolean;
};

const EditOccurrence: FC<Props> = ({
  samples,
  navigateToOccurrence,
  deleteSample,
  isDisabled,
}) => {
  const match = useRouteMatch();

  const getSamplesList = () => {
    const getOccurrence = (smp: Sample) => {
      const occ = smp.occurrences[0];
      const prettyTime = new Date(smp.metadata.createdOn)
        .toLocaleTimeString()
        .replace(/(:\d{2}| [AP]M)$/, '');

      const { stage, dragonflyStage } = occ.attrs;

      let location;
      if (smp.hasLoctionMissingAndIsnotLocating()) {
        location = <IonIcon icon={warningOutline} color="danger" />;
      } else {
        location = <GridRefValue sample={smp} />;
      }

      const navigateToOccurrenceWithSample = () => navigateToOccurrence(smp);

      const deleteSubSample = () => deleteSample(smp);

      return (
        <IonItemSliding key={smp.cid}>
          <IonItem detail onClick={navigateToOccurrenceWithSample}>
            <IonLabel className="time">{prettyTime}</IonLabel>
            <IonLabel className="stage">
              <IonBadge color="medium">
                <T>{stage || dragonflyStage}</T>
              </IonBadge>
            </IonLabel>
            <IonLabel slot="end">{location}</IonLabel>
          </IonItem>
          {!isDisabled && (
            <IonItemOptions side="end">
              <IonItemOption color="danger" onClick={deleteSubSample}>
                <T>Delete</T>
              </IonItemOption>
            </IonItemOptions>
          )}
        </IonItemSliding>
      );
    };

    return samples.map(getOccurrence);
  };

  if (!samples[0]) {
    return (
      <Main id="area-count-occurrence-edit">
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      </Main>
    );
  }

  const species = samples[0].occurrences[0].getTaxonCommonAndScientificNames();

  const count = samples.length > 1 ? samples.length : null;

  const speciesGroupImage = samples[0].occurrences[0].getSpeciesGroupIcon();

  return (
    <Main id="area-count-occurrence-edit">
      <IonList lines="full">
        {!samples[0].isPreciseSingleSpeciesSurvey() && (
          <div className="rounded">
            <MenuAttrItem
              routerLink={`${match.url}/taxon`}
              disabled={isDisabled}
              icon={speciesGroupImage}
              label="Species"
              value={<TaxonPrettyName name={species} />}
              skipValueTranslation
              className="taxon-entry"
            />
          </div>
        )}

        <div className="rounded">
          <IonItemDivider className="species-list-header">
            <IonLabel>
              <T>Time</T>
            </IonLabel>
            <IonLabel>
              <T>Stage</T>
            </IonLabel>
            <IonLabel>{count}</IonLabel>
          </IonItemDivider>

          {getSamplesList()}
        </div>
      </IonList>
    </Main>
  );
};

export default observer(EditOccurrence);
