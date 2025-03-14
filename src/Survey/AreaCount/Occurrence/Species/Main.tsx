import { observer } from 'mobx-react';
import { warningOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Badge, Main, MenuAttrItem } from '@flumens';
import {
  IonList,
  IonItem,
  IonLabel,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonIcon,
} from '@ionic/react';
import Sample from 'models/sample';
import GridRefValue from 'Components/GridRefValue';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import './styles.scss';

type Props = {
  samples: Sample[];
  navigateToOccurrence: (smp: Sample) => void;
  deleteSample: (smp: Sample) => void;
  isDisabled?: boolean;
};

const EditOccurrence = ({
  samples,
  navigateToOccurrence,
  deleteSample,
  isDisabled,
}: Props) => {
  const match = useRouteMatch();

  const getSamplesList = () => {
    const getOccurrence = (smp: Sample) => {
      const occ = smp.occurrences[0];
      const prettyTime = new Date(smp.createdAt)
        .toLocaleTimeString()
        .replace(/(:\d{2}| [AP]M)$/, '');

      const { stage, dragonflyStage } = occ.data;

      let location;
      if (smp.hasLoctionMissingAndIsnotLocating()) {
        if (!isDisabled)
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
              <Badge>{stage || dragonflyStage}</Badge>
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

  const firstSubSample = samples[0];

  const getSpecies = () => {
    const species =
      firstSubSample.occurrences[0].getTaxonCommonAndScientificNames();

    const count = samples.length > 1 ? samples.length : null;

    const speciesGroupImage =
      firstSubSample.occurrences[0].getSpeciesGroupIcon();

    return (
      <IonList lines="full">
        {!firstSubSample.isPreciseSingleSpeciesSurvey() && (
          <div className="rounded-list">
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

        <div className="rounded-list mt-5">
          <div className="list-divider gap-10">
            <div>
              <T>Time</T>
            </div>
            <div className="flex w-full justify-between">
              <div>
                <T>Stage</T>
              </div>
              <div>{count}</div>
            </div>
          </div>

          {getSamplesList()}
        </div>
      </IonList>
    );
  };

  return (
    <Main>
      {!firstSubSample && (
        <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
      )}

      {firstSubSample && getSpecies()}
    </Main>
  );
};

export default observer(EditOccurrence);
