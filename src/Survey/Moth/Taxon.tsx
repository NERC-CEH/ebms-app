/* eslint-disable no-param-reassign */
import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Main, Header, useAlert } from '@flumens';
import { NavContext } from '@ionic/react';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch from 'Components/TaxonSearch';
import { getUnkownSpecies, MachineInvolvement } from 'Survey/Moth/config';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

interface Props {
  sample: Sample;
  occurrence?: Occurrence;
}

const Taxon: FC<Props> = ({ sample, occurrence }) => {
  const alert = useAlert();
  const { navigate, goBack } = useContext(NavContext);
  const UNKNOWN_SPECIES = getUnkownSpecies();

  const onSpeciesSelected = async (taxon: any) => {
    const { isRecorded } = taxon;
    const survey = sample.getSurvey();

    let machineInvolvement = MachineInvolvement.HUMAN;
    const topAISuggestion = occurrence?.getTopSuggestion();
    if (topAISuggestion) {
      const selectedTopSuggestion =
        topAISuggestion.warehouse_id === taxon.warehouse_id;
      if (selectedTopSuggestion) {
        machineInvolvement = MachineInvolvement.HUMAN_ACCEPTED_PREFERRED;
      } else {
        machineInvolvement = MachineInvolvement.HUMAN_ACCEPTED_LESS_PREFERRED;
      }
    }

    const isTaxonUnknown = taxon.warehouse_id === UNKNOWN_SPECIES.warehouse_id;

    if (occurrence && isTaxonUnknown) {
      Object.assign(occurrence.attrs.taxon, taxon, { machineInvolvement });
      occurrence.save();
      navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence && isRecorded && !isTaxonUnknown) {
      const selectedTaxon = (selectedOccurrence: Occurrence) => {
        return (
          occurrence.attrs.taxon?.warehouse_id &&
          selectedOccurrence !== occurrence &&
          selectedOccurrence.attrs.comment === occurrence?.attrs?.comment &&
          selectedOccurrence.attrs.identifier === occurrence?.attrs?.identifier
        );
      };

      const occWithSameSpecies = sample.occurrences.find(selectedTaxon);
      if (!occWithSameSpecies) {
        Object.assign(occurrence.attrs.taxon, taxon, { machineInvolvement });
        occurrence.save();
        navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
        return;
      }

      const isSelectedSameSpecies =
        taxon.warehouse_id === occurrence.attrs.taxon.warehouse_id;
      if (isSelectedSameSpecies) {
        navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
        return;
      }

      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      occWithSameSpecies.attrs.count += occurrence.attrs.count;
      occWithSameSpecies.attrs['count-outside'] +=
        occurrence.attrs['count-outside'];

      while (occurrence.media.length) {
        const copy = occurrence.media.pop() as Media;
        occWithSameSpecies.media.push(copy);
      }
      occWithSameSpecies.save();

      occurrence.destroy();

      navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence && !isTaxonUnknown) {
      Object.assign(occurrence.attrs.taxon, taxon, { machineInvolvement });
      occurrence.save();

      goBack();
      return;
    }

    if (isTaxonUnknown) {
      // we allow multiple unknown entries
      const identifier = sample.attrs.recorder;
      const newOccurrence = survey.occ!.create!({
        Occurrence,
        taxon,
        identifier,
      });
      newOccurrence.attrs.taxon.machineInvolvement = machineInvolvement;
      sample.occurrences.push(newOccurrence);
      await sample.save();
      goBack();
      return;
    }

    const selectedTaxon = (occ: Occurrence) => {
      return occ.doesTaxonMatch(taxon);
    };

    const existingOccurrence = sample.occurrences.find(selectedTaxon);
    if (existingOccurrence) {
      existingOccurrence.attrs.count += 1;
      existingOccurrence.save();
      await sample.save();
      goBack();
      return;
    }

    const identifier = sample.attrs.recorder;
    const newOccurrence = survey.occ!.create!({
      Occurrence,
      taxon,
      identifier,
    });
    newOccurrence.attrs.taxon.machineInvolvement = machineInvolvement;
    sample.occurrences.push(newOccurrence);

    await sample.save();
    goBack();
  };

  const getTaxonId = (occ: Occurrence) => {
    return occ.attrs.taxon?.preferredId || occ.attrs.taxon?.warehouse_id;
  };

  const species = sample.occurrences.map(getTaxonId);

  const recordedTaxa = [...species];

  return (
    <Page id="moth-survey-taxasearch">
      <Header title="Species" />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={['moths']}
          useDayFlyingMothsOnly={false}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
