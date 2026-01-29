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
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const checkIfTaxonSelectedSame = (
  taxon: Taxon,
  sectionOccurrence?: Occurrence
) => {
  if (!sectionOccurrence) return false;

  const { preferredId, warehouse_id: warehouseId } =
    sectionOccurrence?.data?.taxon || {};

  if (preferredId) {
    return (
      warehouseId === taxon.warehouse_id || preferredId === taxon?.preferredId
    );
  }

  return warehouseId === taxon.warehouse_id;
};

const Controller = () => {
  const alert = useAlert();
  const { goBack, navigate } = useContext(NavContext);
  const match: any = useRouteMatch();

  const { subSample: sectionSample, occurrence: sectionOccurrence } = useSample<
    Sample,
    Occurrence
  >();

  if (!sectionSample) return null;

  const getTaxonId = (occ: Occurrence) =>
    occ.data.taxon.preferredId || occ.data.taxon.warehouse_id;
  const recordedTaxa = sectionSample.occurrences.map(getTaxonId);

  const onSpeciesSelected = async (taxon: Taxon) => {
    const { taxa }: any = match.params;
    const { isRecorded }: any = taxon;

    // bumblebees and dragonflies does not have preferredId
    const isTaxonSelectedSame = checkIfTaxonSelectedSame(
      taxon,
      sectionOccurrence
    );

    const byId = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
    const occWithSameSpecies = sectionSample.occurrences.find(byId);

    const isOccurrenceEditPage = occWithSameSpecies && isRecorded && taxa;

    if (isOccurrenceEditPage && isTaxonSelectedSame) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      goBack();
      return;
    }

    if (sectionOccurrence && isOccurrenceEditPage && !isTaxonSelectedSame) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      occWithSameSpecies.data.count += sectionOccurrence.data.count;

      if (
        sectionOccurrence.data.taxon.group !== DRAGONFLY_GROUP &&
        taxon.group === DRAGONFLY_GROUP
      ) {
        sectionOccurrence.data.dragonflyStage = 'Adult';

        sectionOccurrence.data.stage = undefined;
      }
      if (
        sectionOccurrence.data.taxon.group === DRAGONFLY_GROUP &&
        taxon.group !== DRAGONFLY_GROUP
      ) {
        sectionOccurrence.data.stage = 'Adult';

        sectionOccurrence.data.dragonflyStage = undefined;
      }

      const hasComment = sectionOccurrence.data.comment;
      if (hasComment) {
        const firstString = occWithSameSpecies.data.comment || '';
        occWithSameSpecies.data.comment = firstString.concat(
          ' ',
          sectionOccurrence.data.comment!
        );
      }

      while (sectionOccurrence.media.length) {
        const copy = sectionOccurrence.media.pop();
        occWithSameSpecies.media.push(copy!);
      }

      occWithSameSpecies.save();
      sectionOccurrence.destroy();
      sectionSample.save();

      navigate(
        `/survey/transect/${sectionSample.parent!.cid}/sections/${
          sectionSample.cid
        }`,
        'none',
        'pop'
      );

      return;
    }

    if (sectionOccurrence && isRecorded && isTaxonSelectedSame) {
      sectionOccurrence.data.count += 1;
      sectionOccurrence.save();

      navigate(
        `/survey/transect/${sectionSample.parent!.cid}/sections/${
          sectionSample.cid
        }`,
        'none',
        'pop'
      );
      return;
    }

    if (!occWithSameSpecies && sectionOccurrence && taxa) {
      if (
        sectionOccurrence.data.taxon.group !== DRAGONFLY_GROUP &&
        taxon.group === DRAGONFLY_GROUP
      ) {
        sectionOccurrence.data.dragonflyStage = 'Adult';

        sectionOccurrence.data.stage = undefined;
      }
      if (
        sectionOccurrence.data.taxon.group === DRAGONFLY_GROUP &&
        taxon.group !== DRAGONFLY_GROUP
      ) {
        sectionOccurrence.data.stage = 'Adult';

        sectionOccurrence.data.dragonflyStage = undefined;
      }

      sectionOccurrence.data.taxon = taxon;
      sectionOccurrence.save();

      navigate(
        `/survey/transect/${sectionSample.parent!.cid}/sections/${
          sectionSample.cid
        }`,
        'none',
        'pop'
      );
      return;
    }

    if (occWithSameSpecies && !taxa) {
      occWithSameSpecies.data.count += 1;
      occWithSameSpecies.save();
      goBack();
      return;
    }

    const survey = sectionSample.getSurvey();
    const occurrence = survey.occ!.create!({ Occurrence, taxon });
    sectionSample.occurrences.push(occurrence);

    await sectionSample.save();
    goBack();
  };

  return (
    <Page id="transect-sections-taxa">
      <Header title="Species" rightSlot={<TaxonSearchFilters />} />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={appModel.data.speciesGroups}
        />
      </Main>
    </Page>
  );
};

export default observer(Controller);
