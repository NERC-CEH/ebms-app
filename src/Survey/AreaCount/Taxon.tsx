import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Page,
  Main,
  Header,
  useAlert,
  useOnBackButton,
  useSample,
} from '@flumens';
import { NavContext, IonButtons, IonButton } from '@ionic/react';
import speciesGroupsList from 'common/data/groups';
import Occurrence, {
  DRAGONFLY_GROUP,
  type Taxon as TaxonData,
} from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch from 'Survey/common/TaxonSearch';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';
import getTaxonListCids from 'Survey/common/getTaxonListCids';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const cancelButtonWrap = (onDeleteSurvey: () => void) => (
  <IonButtons slot="start">
    <IonButton onClick={onDeleteSurvey}>
      <T>common.cancel</T>
    </IonButton>
  </IonButtons>
);

function useDeleteSurveyPrompt(alert: ReturnType<typeof useAlert>) {
  const deleteSurveyPromt = (resolve: (param: boolean) => void) => {
    alert({
      header: 'area.deleteSurvey',
      message: 'area.warningWillDiscard',
      buttons: [
        {
          text: 'common.cancel',
          role: 'cancel',
          handler: () => resolve(false),
        },
        {
          text: 'area.discard',
          role: 'destructive',
          handler: () => resolve(true),
        },
      ],
    });
  };

  const deleteSurveyPromtWrap = () => new Promise(deleteSurveyPromt);

  return deleteSurveyPromtWrap;
}

const TaxonController = () => {
  const { goBack, navigate } = useContext(NavContext);
  const match = useRouteMatch<{ taxa?: string }>();
  const alert = useAlert();
  const [isAlertPresent, setIsAlertPresent] = useState(false);
  const shouldDeleteSurvey = useDeleteSurveyPrompt(alert);

  const { sample, occurrence } = useSample<Sample, Occurrence>();
  if (!sample) throw new Error('Sample is missing');

  const isLocationLocked = () =>
    sample.locks.isLocked('all', 'smp', 'location');

  const onDeleteSurvey = async () => {
    if (!sample.isSingleSpeciesSurvey()) {
      goBack();
      return;
    }

    if (!sample.isSingleSpeciesSurvey() || isAlertPresent) {
      goBack();
      return;
    }

    setIsAlertPresent(true);

    const change = await shouldDeleteSurvey();
    if (change) {
      await sample.destroy();
      setIsAlertPresent(false);
      navigate('/home/user-surveys', 'root', 'push', undefined, {
        unmount: true,
      });
      return;
    }

    setIsAlertPresent(false);
  };

  useOnBackButton(onDeleteSurvey);

  const onSpeciesSelected = async (
    taxon: TaxonData & { isRecorded?: boolean }
  ) => {
    const { taxa } = match.params;
    const { isRecorded } = taxon;

    if (taxa && isRecorded) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);

      if (!mergeSpecies) {
        return;
      }
    }

    if (taxa) {
      const selectedTaxon = ({ occurrences }: Sample) => {
        const [occ] = occurrences; // always one

        return (
          occ.data.taxon.preferredId === parseInt(taxa, 10) ||
          occ.data.taxon.warehouseId === parseInt(taxa, 10)
        );
      };
      const assignTaxon = ({ occurrences }: Sample) => {
        const [occ] = occurrences; // always one

        if (
          occ.data.taxon.taxonGroupId === DRAGONFLY_GROUP &&
          taxon.taxonGroupId !== DRAGONFLY_GROUP
        ) {
          occ.data.stage = 'Adult';
          occ.data.dragonflyStage = undefined;
        }

        if (
          occ.data.taxon.taxonGroupId !== DRAGONFLY_GROUP &&
          taxon.taxonGroupId === DRAGONFLY_GROUP
        ) {
          occ.data.dragonflyStage = 'Adult';
          occ.data.stage = undefined;
        }

        occ.data.taxon = taxon;
      };
      sample.samples.filter(selectedTaxon).forEach(assignTaxon);

      await sample.save();

      goBack();

      return;
    }

    if (occurrence) {
      if (
        occurrence.data.taxon.taxonGroupId !== DRAGONFLY_GROUP &&
        taxon.taxonGroupId === DRAGONFLY_GROUP
      ) {
        occurrence.data.dragonflyStage = 'Adult';

        occurrence.data.stage = undefined;
      }
      if (
        occurrence.data.taxon.taxonGroupId === DRAGONFLY_GROUP &&
        taxon.taxonGroupId !== DRAGONFLY_GROUP
      ) {
        occurrence.data.stage = 'Adult';

        occurrence.data.dragonflyStage = undefined;
      }

      occurrence.data.taxon = taxon;
    } else {
      const survey = sample.getSurvey();
      const zeroAbundance = !!sample.isSurveyPreciseSingleSpecies();

      const newSample = survey.smp!.create!({
        taxon,
        zeroAbundance,
        parent: sample,
      });
      sample.samples.push(newSample);

      if (sample.isPaintedLadySurvey()) {
        sample.samples[0].occurrences[0].data.wing = [];

        delete sample.samples[0].occurrences[0].data.behaviour;
        sample.save();
      }

      if (!sample.isSurveyPreciseSingleSpecies()) {
        if (!sample.isTimerFinished() && !isLocationLocked())
          newSample.gps.start();
      }
    }

    await sample.save();

    if (sample.isSingleSpeciesSurvey()) {
      const path = match.url.replace('/taxon', '/details');

      navigate(path, 'forward', 'replace', undefined, {
        unmount: true,
      });
      return;
    }

    goBack();
  };

  const getTaxonId = (smp: Sample) => {
    const occ = smp.occurrences[0];
    return occ.data.taxon.preferredId || occ.data.taxon.warehouseId;
  };
  const species = sample.samples.map(getTaxonId);

  const getShallowTaxonId = (taxon: TaxonData) =>
    taxon.preferredId || taxon.warehouseId;
  const shallowSpecies = sample.shallowSpeciesList.map(getShallowTaxonId);

  const recordedTaxa = [...species, ...shallowSpecies];

  const title = sample.isSingleSpeciesSurvey()
    ? 'area.selectTargetSpecies'
    : 'common.species';

  const showCancelButton = sample.isSingleSpeciesSurvey();

  useEffect(() => {
    // backward compatibility, remove once all users have updated
    // fix speciesGroups in case are 'butterflies' strings from old surveys, get ids
    const speciesGroups = sample.data.speciesGroups || [];
    if (speciesGroups.every(sg => typeof sg === 'number')) return;

    const updatedSpeciesGroups = speciesGroups
      .map(sg => (typeof sg === 'string' ? speciesGroupsList[sg]?.id : sg))
      .filter(id => id !== undefined);
    sample.data.speciesGroups = updatedSpeciesGroups;
  }, []);

  return (
    <Page id="precise-area-count-edit-taxa">
      <Header
        title={title}
        rightSlot={<TaxonSearchFilters sample={sample} />}
        BackButton={
          showCancelButton ? () => cancelButtonWrap(onDeleteSurvey) : undefined
        }
      />

      <Main className="pb-ion-s-10">
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={sample.data.speciesGroups}
          useDayFlyingMothsOnly={sample.metadata.useDayFlyingMothsOnly}
          taxonListCids={getTaxonListCids(sample)}
        />
      </Main>
    </Page>
  );
};

export default observer(TaxonController);
