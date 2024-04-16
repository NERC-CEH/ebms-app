import { useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Page, Main, Header, useAlert, useOnBackButton } from '@flumens';
import { NavContext, IonButtons, IonButton } from '@ionic/react';
import Occurrence, { DRAGONFLY_GROUP } from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch from 'Survey/common/TaxonSearch';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const cancelButtonWrap = (onDeleteSurvey: any) => {
  return (
    <IonButtons slot="start">
      <IonButton onClick={onDeleteSurvey}>
        <T>Cancel</T>
      </IonButton>
    </IonButtons>
  );
};

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

type Props = {
  sample: Sample;
  occurrence: Occurrence;
};

const TaxonController = ({ sample, occurrence }: Props) => {
  const { goBack, navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const alert = useAlert();
  const [isAlertPresent, setIsAlertPresent] = useState(false);
  const shouldDeleteSurvey = useDeleteSurveyPrompt(alert);

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

  if (!sample) return null;

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
          occ.attrs.taxon.preferredId === parseInt(taxa, 10) ||
          occ.attrs.taxon.warehouse_id === parseInt(taxa, 10)
        );
      };
      const assignTaxon = ({ occurrences }: Sample) => {
        const [occ] = occurrences; // always one

        if (
          occ.attrs.taxon.group === DRAGONFLY_GROUP &&
          taxon.group !== DRAGONFLY_GROUP
        ) {
          occ.attrs.stage = 'Adult';
          occ.attrs.dragonflyStage = undefined;
        }

        if (
          occ.attrs.taxon.group !== DRAGONFLY_GROUP &&
          taxon.group === DRAGONFLY_GROUP
        ) {
          occ.attrs.dragonflyStage = 'Adult';
          occ.attrs.stage = undefined;
        }

        occ.attrs.taxon = taxon;
      };
      sample.samples.filter(selectedTaxon).forEach(assignTaxon);

      await sample.save();

      goBack();

      return;
    }

    if (occurrence) {
      if (
        occurrence.attrs.taxon.group !== DRAGONFLY_GROUP &&
        taxon.group === DRAGONFLY_GROUP
      ) {
        // eslint-disable-next-line no-param-reassign
        occurrence.attrs.dragonflyStage = 'Adult';
        // eslint-disable-next-line no-param-reassign
        occurrence.attrs.stage = undefined;
      }
      if (
        occurrence.attrs.taxon.group === DRAGONFLY_GROUP &&
        taxon.group !== DRAGONFLY_GROUP
      ) {
        // eslint-disable-next-line no-param-reassign
        occurrence.attrs.stage = 'Adult';
        // eslint-disable-next-line no-param-reassign
        occurrence.attrs.dragonflyStage = undefined;
      }

      // eslint-disable-next-line
      occurrence.attrs.taxon = taxon;
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
        // eslint-disable-next-line no-param-reassign
        sample.samples[0].occurrences[0].attrs.wing = [];
        // eslint-disable-next-line no-param-reassign
        sample.samples[0].occurrences[0].attrs.behaviour = null;
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
    return occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
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
          speciesGroups={sample.metadata.speciesGroups}
          useDayFlyingMothsOnly={sample.metadata.useDayFlyingMothsOnly}
        />
      </Main>
    </Page>
  );
};

export default observer(TaxonController);
