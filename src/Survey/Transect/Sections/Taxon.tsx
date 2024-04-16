import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Main, Header, useAlert } from '@flumens';
import { NavContext } from '@ionic/react';
import Occurrence, { Taxon, DRAGONFLY_GROUP } from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch from 'Survey/common/TaxonSearch';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

const checkIfTaxonSelectedSame = (
  sectionOccurrence: Occurrence,
  taxon: Taxon
) => {
  if (!sectionOccurrence) return false;

  const { preferredId, warehouse_id } = sectionOccurrence?.attrs?.taxon || {};

  if (preferredId) {
    return (
      warehouse_id === taxon.warehouse_id || preferredId === taxon?.preferredId
    );
  }

  return warehouse_id === taxon.warehouse_id;
};

type Props = {
  subSample: Sample;
  occurrence: Occurrence;
};

const Controller = ({
  subSample: sectionSample,
  occurrence: sectionOccurrence,
}: Props) => {
  const alert = useAlert();
  const { goBack, navigate } = useContext(NavContext);
  const match: any = useRouteMatch();

  const getTaxonId = (occ: Occurrence) =>
    occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
  const recordedTaxa = sectionSample.occurrences.map(getTaxonId);

  const onSpeciesSelected = async (taxon: Taxon) => {
    const { taxa }: any = match.params;
    const { isRecorded }: any = taxon;

    // bumblebees and dragonflies does not have preferredId
    const isTaxonSelectedSame = checkIfTaxonSelectedSame(
      sectionOccurrence,
      taxon
    );

    const byId = (occ: Occurrence) => {
      return occ.doesTaxonMatch(taxon);
    };
    const occWithSameSpecies = sectionSample.occurrences.find(byId);

    const isOccurrenceEditPage = occWithSameSpecies && isRecorded && taxa;

    if (isOccurrenceEditPage && isTaxonSelectedSame) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      goBack();
      return;
    }

    if (isOccurrenceEditPage && !isTaxonSelectedSame) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);
      if (!mergeSpecies) return;

      occWithSameSpecies.attrs.count += sectionOccurrence.attrs.count;

      if (
        sectionOccurrence.attrs.taxon.group !== DRAGONFLY_GROUP &&
        taxon.group === DRAGONFLY_GROUP
      ) {
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.dragonflyStage = 'Adult';
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.stage = undefined;
      }
      if (
        sectionOccurrence.attrs.taxon.group === DRAGONFLY_GROUP &&
        taxon.group !== DRAGONFLY_GROUP
      ) {
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.stage = 'Adult';
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.dragonflyStage = undefined;
      }

      const hasComment = sectionOccurrence.attrs.comment;
      if (hasComment) {
        const firstString = occWithSameSpecies.attrs.comment || '';
        occWithSameSpecies.attrs.comment = firstString.concat(
          ' ',
          sectionOccurrence.attrs.comment!
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
      // eslint-disable-next-line no-param-reassign
      sectionOccurrence.attrs.count += 1;
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
        sectionOccurrence.attrs.taxon.group !== DRAGONFLY_GROUP &&
        taxon.group === DRAGONFLY_GROUP
      ) {
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.dragonflyStage = 'Adult';
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.stage = undefined;
      }
      if (
        sectionOccurrence.attrs.taxon.group === DRAGONFLY_GROUP &&
        taxon.group !== DRAGONFLY_GROUP
      ) {
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.stage = 'Adult';
        // eslint-disable-next-line no-param-reassign
        sectionOccurrence.attrs.dragonflyStage = undefined;
      }

      // eslint-disable-next-line no-param-reassign
      sectionOccurrence.attrs.taxon = taxon;
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
      occWithSameSpecies.attrs.count += 1;
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
      <Header
        title="Species"
        rightSlot={<TaxonSearchFilters sample={sectionSample.parent!} />}
      />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={sectionSample?.parent!.metadata.speciesGroups}
          useDayFlyingMothsOnly={
            sectionSample?.parent!.metadata.useDayFlyingMothsOnly
          }
        />
      </Main>
    </Page>
  );
};

export default observer(Controller);
