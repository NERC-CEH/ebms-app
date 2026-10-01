import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Main, Header, useAlert, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import groups from 'common/data/groups';
import Media from 'models/media';
import Occurrence, { Taxon as TaxonData } from 'models/occurrence';
import Sample from 'models/sample';
import { getUnknownSpecies, MachineInvolvement } from 'Survey/MothTrap/config';
import TaxonSearch from 'Survey/common/TaxonSearch';
import getTaxonListCids from 'Survey/common/getTaxonListCids';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const Taxon = () => {
  const alert = useAlert();
  const { navigate, goBack } = useContext(NavContext);
  const UNKNOWN_SPECIES = getUnknownSpecies();

  const isAllowedTaxon = (taxon: TaxonData) =>
    taxon.taxonGroupId === groups.moths.id ||
    taxon.warehouseId === UNKNOWN_SPECIES.warehouseId;

  const { sample, occurrence } = useSample<Sample, Occurrence>();
  if (!sample) return null;

  const onSpeciesSelected = async (
    taxon: TaxonData & { isRecorded?: boolean }
  ) => {
    if (!isAllowedTaxon(taxon)) return;

    const { isRecorded } = taxon;
    const survey = sample.getSurvey();

    let machineInvolvement = MachineInvolvement.HUMAN;
    const topAISuggestion = occurrence?.getTopSuggestion();
    if (topAISuggestion) {
      const selectedTopSuggestion =
        topAISuggestion.warehouseId === taxon.warehouseId;
      if (selectedTopSuggestion) {
        machineInvolvement = MachineInvolvement.HUMAN_ACCEPTED_PREFERRED;
      } else {
        machineInvolvement = MachineInvolvement.HUMAN_ACCEPTED_LESS_PREFERRED;
      }
    }

    const isTaxonUnknown = taxon.warehouseId === UNKNOWN_SPECIES.warehouseId;

    if (occurrence && isTaxonUnknown) {
      Object.assign(occurrence.data.taxon, taxon, { machineInvolvement });
      occurrence.save();
      navigate(`/survey/moth/${sample.id || sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence && isRecorded && !isTaxonUnknown) {
      const selectedTaxon = (selectedOccurrence: Occurrence) =>
        occurrence.data.taxon?.warehouseId &&
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
        taxon.warehouseId === occurrence.data.taxon.warehouseId;
      if (isSelectedSameSpecies) {
        navigate(`/survey/moth/${sample.id || sample.cid}`, 'none', 'pop');
        return;
      }

      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      occWithSameSpecies.data.count =
        (occWithSameSpecies.data.count || 0) + (occurrence.data.count || 0);
      occWithSameSpecies.data['count-outside'] =
        (occWithSameSpecies.data['count-outside'] || 0) +
        (occurrence.data['count-outside'] || 0);

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
      const newOccurrence = survey.occ!.create!({ taxon, identifier });
      newOccurrence.data.taxon.machineInvolvement = machineInvolvement;
      sample.occurrences.push(newOccurrence);
      await sample.save();
      goBack();
      return;
    }

    const selectedTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);

    const existingOccurrence = sample.occurrences.find(selectedTaxon);
    if (existingOccurrence) {
      existingOccurrence.data.count = (existingOccurrence.data.count || 0) + 1;
      existingOccurrence.save();
      await sample.save();
      goBack();
      return;
    }

    const identifier = sample.data.recorder;
    const newOccurrence = survey.occ!.create!({ taxon, identifier });
    newOccurrence.data.taxon.machineInvolvement = machineInvolvement;
    sample.occurrences.push(newOccurrence);

    await sample.save();
    goBack();
  };

  const getTaxonId = (occ: Occurrence) =>
    occ.data.taxon?.preferredId || occ.data.taxon?.warehouseId;

  const species = sample.occurrences.map(getTaxonId);

  const recordedTaxa = [...species];

  const byProbabilityDesc = (
    a: { probability?: number },
    b: { probability?: number }
  ) => (b.probability ?? 0) - (a.probability ?? 0);

  const suggestions =
    occurrence?.media.flatMap(m => m.data.species || []) || [];
  const uniqueSuggestions = new Map(
    suggestions.map(s => [s.warehouseId, s])
  ).values();
  const sortedSuggestions = [...uniqueSuggestions]
    .filter(isAllowedTaxon)
    .sort(byProbabilityDesc);

  return (
    <Page id="moth-survey-taxasearch">
      <Header title="common.species" />
      <Main className="pb-ion-s-10">
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          suggestedSpecies={sortedSuggestions}
          recordedTaxa={recordedTaxa}
          speciesGroups={[groups.moths.id]}
          useDayFlyingMothsOnly={false}
          taxonListCids={getTaxonListCids(sample)}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
