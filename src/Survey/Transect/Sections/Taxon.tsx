import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Main, Header, useAlert, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'common/models/app';
import Occurrence, { Taxon, DRAGONFLY_GROUP } from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch from 'Survey/common/TaxonSearch';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';
import getTaxonListCids from 'Survey/common/getTaxonListCids';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const checkIfTaxonSelectedSame = (
  taxon: Taxon,
  sectionOccurrence?: Occurrence
) => {
  if (!sectionOccurrence) return false;

  const { preferredId, warehouseId } = sectionOccurrence?.data?.taxon || {};

  if (preferredId) {
    return (
      warehouseId === taxon.warehouseId || preferredId === taxon?.preferredId
    );
  }

  return warehouseId === taxon.warehouseId;
};

const Controller = () => {
  const alert = useAlert();
  const { goBack, navigate } = useContext(NavContext);
  const match = useRouteMatch<{ taxa?: string }>();

  const { subSample: sample, occurrence } = useSample<Sample, Occurrence>();
  if (!sample) return null;

  const getTaxonId = (occ: Occurrence) =>
    occ.data.taxon.preferredId || occ.data.taxon.warehouseId;
  const recordedTaxa = sample.occurrences.map(getTaxonId);

  const onSpeciesSelected = async (taxon: Taxon & { isRecorded?: boolean }) => {
    const { taxa } = match.params;
    const { isRecorded } = taxon;

    // bumblebees and dragonflies does not have preferredId
    const isTaxonSelectedSame = checkIfTaxonSelectedSame(taxon, occurrence);

    const byId = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
    const occWithSameSpecies = sample.occurrences.find(byId);

    const isOccurrenceEditPage = occWithSameSpecies && isRecorded && taxa;

    if (isOccurrenceEditPage && isTaxonSelectedSame) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      goBack();
      return;
    }

    if (occurrence && isOccurrenceEditPage && !isTaxonSelectedSame) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      occWithSameSpecies.data.count =
        (occWithSameSpecies.data.count || 0) + (occurrence.data.count || 0);

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

      const hasComment = occurrence.data.comment;
      if (hasComment) {
        const firstString = occWithSameSpecies.data.comment || '';
        occWithSameSpecies.data.comment = firstString.concat(
          ' ',
          occurrence.data.comment!
        );
      }

      while (occurrence.media.length) {
        const copy = occurrence.media.pop();
        occWithSameSpecies.media.push(copy!);
      }

      occWithSameSpecies.save();
      occurrence.destroy();
      sample.save();

      navigate(
        `/survey/transect/${sample.parent!.cid}/sections/${sample.cid}`,
        'none',
        'pop'
      );

      return;
    }

    if (occurrence && isRecorded && isTaxonSelectedSame) {
      occurrence.data.count = (occurrence.data.count || 0) + 1;
      occurrence.save();

      navigate(
        `/survey/transect/${sample.parent!.cid}/sections/${sample.cid}`,
        'none',
        'pop'
      );
      return;
    }

    if (!occWithSameSpecies && occurrence && taxa) {
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
      occurrence.save();

      navigate(
        `/survey/transect/${sample.parent!.cid}/sections/${sample.cid}`,
        'none',
        'pop'
      );
      return;
    }

    if (occWithSameSpecies && !taxa) {
      occWithSameSpecies.data.count = (occWithSameSpecies.data.count || 0) + 1;
      occWithSameSpecies.save();
      goBack();
      return;
    }

    const survey = sample.getSurvey();
    const newOccurrence = survey.occ!.create!({ taxon });
    sample.occurrences.push(newOccurrence);

    await sample.save();
    goBack();
  };

  return (
    <Page id="transect-sections-taxa">
      <Header title="common.species" rightSlot={<TaxonSearchFilters />} />
      <Main className="pb-ion-s-10">
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={appModel.data.speciesGroups}
          taxonListCids={getTaxonListCids(sample)}
        />
      </Main>
    </Page>
  );
};

export default observer(Controller);
