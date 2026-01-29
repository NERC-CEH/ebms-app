import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Main, Header, useAlert, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import groups from 'common/data/groups';
import Media from 'models/media';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { getUnknownSpecies, MachineInvolvement } from 'Survey/Moth/config';
import TaxonSearch from 'Survey/common/TaxonSearch';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const Taxon = () => {
  const alert = useAlert();
  const { navigate, goBack } = useContext(NavContext);
  const UNKNOWN_SPECIES = getUnknownSpecies();

  const { sample, occurrence } = useSample<Sample, Occurrence>();
  if (!sample) return null;

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
      Object.assign(occurrence.data.taxon, taxon, { machineInvolvement });
      occurrence.save();
      navigate(`/survey/moth/${sample.id || sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence && isRecorded && !isTaxonUnknown) {
      const selectedTaxon = (selectedOccurrence: Occurrence) =>
        occurrence.data.taxon?.warehouse_id &&
        selectedOccurrence !== occurrence &&
        selectedOccurrence.data.comment === occurrence?.data?.comment &&
        selectedOccurrence.data.identifier === occurrence?.data?.identifier;

      const occWithSameSpecies = sample.occurrences.find(selectedTaxon);
      if (!occWithSameSpecies) {
        Object.assign(occurrence.data.taxon, taxon, { machineInvolvement });
        occurrence.save();
        navigate(`/survey/moth/${sample.id || sample.cid}`, 'none', 'pop');
        return;
      }

      const isSelectedSameSpecies =
        taxon.warehouse_id === occurrence.data.taxon.warehouse_id;
      if (isSelectedSameSpecies) {
        navigate(`/survey/moth/${sample.id || sample.cid}`, 'none', 'pop');
        return;
      }

      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      occWithSameSpecies.data.count += occurrence.data.count;
      occWithSameSpecies.data['count-outside'] +=
        occurrence.data['count-outside'];

      while (occurrence.media.length) {
        const copy = occurrence.media.pop() as Media;
        occWithSameSpecies.media.push(copy);
      }
      occWithSameSpecies.save();

      occurrence.destroy();

      navigate(`/survey/moth/${sample.id || sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence && !isTaxonUnknown) {
      Object.assign(occurrence.data.taxon, taxon, { machineInvolvement });
      occurrence.save();

      goBack();
      return;
    }

    if (isTaxonUnknown) {
      // we allow multiple unknown entries
      const identifier = sample.data.recorder;
      const newOccurrence = survey.occ!.create!({
        Occurrence,
        taxon,
        identifier,
      });
      newOccurrence.data.taxon.machineInvolvement = machineInvolvement;
      sample.occurrences.push(newOccurrence);
      await sample.save();
      goBack();
      return;
    }

    const selectedTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);

    const existingOccurrence = sample.occurrences.find(selectedTaxon);
    if (existingOccurrence) {
      existingOccurrence.data.count += 1;
      existingOccurrence.save();
      await sample.save();
      goBack();
      return;
    }

    const identifier = sample.data.recorder;
    const newOccurrence = survey.occ!.create!({
      Occurrence,
      taxon,
      identifier,
    });
    newOccurrence.data.taxon.machineInvolvement = machineInvolvement;
    sample.occurrences.push(newOccurrence);

    await sample.save();
    goBack();
  };

  const getTaxonId = (occ: Occurrence) =>
    occ.data.taxon?.preferredId || occ.data.taxon?.warehouse_id;

  const species = sample.occurrences.map(getTaxonId);

  const recordedTaxa = [...species];

  return (
    <Page id="moth-survey-taxasearch">
      <Header title="Species" />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={[groups.moths.id]}
          useDayFlyingMothsOnly={false}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
