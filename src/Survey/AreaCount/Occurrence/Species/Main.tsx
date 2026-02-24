import { observer } from 'mobx-react';
import { warningOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Badge, Main } from '@flumens';
import {
  IonList,
  IonItem,
  IonLabel,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonIcon,
} from '@ionic/react';
import { getSpeciesProfileImage } from 'common/data/profiles';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import PrettyLocation from 'Components/PrettyLocation';
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
        location = <PrettyLocation sample={smp} />;
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
    const [occ] = firstSubSample.occurrences;

    const count = samples.length > 1 ? samples.length : null;

    return (
      <IonList lines="full">
        {!firstSubSample.isPreciseSingleSpeciesSurvey() && (
          <div className="rounded-list">
            <IonItem
              routerLink={`${match.url}/taxon`}
              disabled={isDisabled}
              className="[--padding-start:5px]"
            >
              <div className="list-avatar my-1 border-neutral-200 border">
                {getSpeciesProfileImage(occ.data.taxon)}
              </div>
              <TaxonPrettyName
                taxon={occ.data.taxon}
                className="text-(--form-value-color) my-2 text-right"
              />
            </IonItem>
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
