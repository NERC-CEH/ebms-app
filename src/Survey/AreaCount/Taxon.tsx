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
import Occurrence, { DRAGONFLY_GROUP } from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch from 'Survey/common/TaxonSearch';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const cancelButtonWrap = (onDeleteSurvey: any) => (
  <IonButtons slot="start">
    <IonButton onClick={onDeleteSurvey}>
      <T>Cancel</T>
    </IonButton>
  </IonButtons>
);

function useDeleteSurveyPrompt(alert: any) {
  const deleteSurveyPromt = (resolve: (param: boolean) => void) => {
    alert({
      header: 'Delete Survey',
      message:
        'Warning - This will discard the survey information you have entered so far.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => resolve(false),
        },
        {
          text: 'Discard',
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
  const match = useRouteMatch();
  const alert = useAlert();
  const [isAlertPresent, setIsAlertPresent] = useState(false);
  const shouldDeleteSurvey = useDeleteSurveyPrompt(alert);

  const { sample, occurrence } = useSample<Sample, Occurrence>();
  if (!sample) throw new Error('Sample is missing');

  const onDeleteSurvey = async () => {
    if (!sample.isPreciseSingleSpeciesSurvey()) {
      goBack();
      return;
    }

    if (!sample.isPreciseSingleSpeciesSurvey() || isAlertPresent) {
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

  const onSpeciesSelected = async (taxon: any) => {
    const { taxa }: any = match.params;
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
          occ.data.taxon.warehouse_id === parseInt(taxa, 10)
        );
      };
      const assignTaxon = ({ occurrences }: Sample) => {
        const [occ] = occurrences; // always one

        if (
          occ.data.taxon.group === DRAGONFLY_GROUP &&
          taxon.group !== DRAGONFLY_GROUP
        ) {
          occ.data.stage = 'Adult';
          occ.data.dragonflyStage = undefined;
        }

        if (
          occ.data.taxon.group !== DRAGONFLY_GROUP &&
          taxon.group === DRAGONFLY_GROUP
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
        occurrence.data.taxon.group !== DRAGONFLY_GROUP &&
        taxon.group === DRAGONFLY_GROUP
      ) {
        occurrence.data.dragonflyStage = 'Adult';

        occurrence.data.stage = undefined;
      }
      if (
        occurrence.data.taxon.group === DRAGONFLY_GROUP &&
        taxon.group !== DRAGONFLY_GROUP
      ) {
        occurrence.data.stage = 'Adult';

        occurrence.data.dragonflyStage = undefined;
      }

      occurrence.data.taxon = taxon;
    } else {
      const survey = sample.getSurvey();
      const zeroAbundance = sample.isSurveyPreciseSingleSpecies() ? 't' : null;

      const newSample = survey.smp!.create!({
        Sample,
        Occurrence,
        taxon,
        zeroAbundance,
      });
      sample.samples.push(newSample);

      if (sample.isPaintedLadySurvey()) {
        sample.samples[0].occurrences[0].data.wing = [];

        sample.samples[0].occurrences[0].data.behaviour = null;
        sample.save();
      }

      if (!sample.isSurveyPreciseSingleSpecies()) {
        newSample.startGPS();
      }
    }

    await sample.save();

    if (sample.isPreciseSingleSpeciesSurvey()) {
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
    return occ.data.taxon.preferredId || occ.data.taxon.warehouse_id;
  };
  const species = sample.samples.map(getTaxonId);

  const getShallowTaxonId = (taxon: any) =>
    taxon.preferredId || taxon.warehouse_id;
  const shallowSpecies = sample.shallowSpeciesList.map(getShallowTaxonId);

  const recordedTaxa = [...species, ...shallowSpecies];

  const title = sample.isPreciseSingleSpeciesSurvey()
    ? 'Select Target Species'
    : 'Species';

  const showCancelButton = sample.isPreciseSingleSpeciesSurvey();

  useEffect(() => {
    // backward compatibility, remove once all users have updated
    // fix speciesGroups in case are 'butterflies' strings from old surveys, get ids
    const speciesGroups = sample.data.speciesGroups || [];
    if (speciesGroups.every(sg => typeof sg === 'number')) return;

    const updatedSpeciesGroups: any = speciesGroups?.map((sg: any) =>
      typeof sg === 'string' ? (speciesGroupsList as any)[sg]?.id : sg
    );
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

      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={sample.data.speciesGroups}
          useDayFlyingMothsOnly={sample.metadata.useDayFlyingMothsOnly}
        />
      </Main>
    </Page>
  );
};

export default observer(TaxonController);
