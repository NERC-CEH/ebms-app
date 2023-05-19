import { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence, { Taxon, DRAGONFLY_GROUP } from 'models/occurrence';
import { NavContext } from '@ionic/react';
import { useRouteMatch } from 'react-router';
import { observer } from 'mobx-react';
import { Page, Main, Header, useAlert } from '@flumens';
import TaxonSearch from 'Components/TaxonSearch';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

type Props = {
  subSample: Sample;
};

const Controller: FC<Props> = ({
  subSample: sectionSample,
  occurrence: sectionOccurrence,
}: any) => {
  const alert = useAlert();
  const { goBack, navigate } = useContext(NavContext);
  const match: any = useRouteMatch();

  const getTaxonId = (occ: Occurrence) =>
    occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
  const recordedTaxa = sectionSample.occurrences.map(getTaxonId);

  const onSpeciesSelected = async (taxon: Taxon) => {
    const { taxa }: any = match.params;
    const { isRecorded }: any = taxon;

    const isTaxonSelectedSame =
      sectionOccurrence &&
      (sectionOccurrence.attrs.taxon.warehouse_id === taxon.warehouse_id ||
        sectionOccurrence.attrs.taxon.preferredId === taxon.preferredId);

    const byId = (occ: Occurrence) => {
      return (
        occ.attrs.taxon.warehouse_id === taxon.warehouse_id ||
        occ.attrs.taxon.preferredId === taxon.preferredId
      );
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
          sectionOccurrence.attrs.comment
        );
      }

      while (sectionOccurrence.media.length) {
        const copy = sectionOccurrence.media.pop();
        occWithSameSpecies.media.push(copy);
      }

      occWithSameSpecies.save();
      sectionOccurrence.destroy();
      sectionSample.save();

      navigate(
        `/survey/transect/${sectionSample.parent.cid}/edit/sections/${sectionSample.cid}`,
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
        `/survey/transect/${sectionSample.parent.cid}/edit/sections/${sectionSample.cid}`,
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
        `/survey/transect/${sectionSample.parent.cid}/edit/sections/${sectionSample.cid}`,
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
    const occurrence = survey.occ.create(Occurrence, { taxon });
    sectionSample.occurrences.push(occurrence);

    await sectionSample.save();
    goBack();
  };

  return (
    <Page id="transect-sections-taxa">
      <Header
        title="Species"
        rightSlot={<TaxonSearchFilters sample={sectionSample.parent} />}
      />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={sectionSample?.parent.metadata.speciesGroups}
          useDayFlyingMothsOnly={
            sectionSample?.parent.metadata.useDayFlyingMothsOnly
          }
        />
      </Main>
    </Page>
  );
};

export default observer(Controller);
