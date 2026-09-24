import { useContext, type RefObject } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Page, Header, useAlert, useToast, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import locations from 'common/models/collections/locations';
import appModel from 'models/app';
import samplesCollection from 'models/collections/samples';
import Occurrence, { Taxon, doesShallowTaxonMatch } from 'models/occurrence';
import Sample from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import Main from './Main';

const useDeleteSpeciesPrompt = () => {
  const alert = useAlert();
  const { t } = useTranslation();

  function showDeleteSpeciesPrompt(taxon: Taxon) {
    const prompt = (resolve: (confirmed: boolean) => void) => {
      const taxonName = taxon.scientificName;
      alert({
        header: t('common.delete'),
        skipTranslation: true,
        message: t('common.confirmDeleteTaxon', {
          taxon: taxonName,
        }),
        buttons: [
          {
            text: t('common.cancel'),
            role: 'cancel',
          },
          {
            text: t('common.delete'),
            role: 'destructive',
            handler: () => resolve(true),
          },
        ],
      });
    };

    return new Promise<boolean>(prompt);
  }

  return showDeleteSpeciesPrompt;
};

function byCreateTime(model1: Sample, model2: Sample) {
  const date1 = new Date(model1.createdAt);
  const date2 = new Date(model2.createdAt);
  return date2.getTime() - date1.getTime();
}

const FIRST_SECTION_INDEX = 0;

const EditController = () => {
  const { navigate, goBack } = useContext(NavContext);
  const { t } = useTranslation();
  const { url } = useRouteMatch();

  const toast = useToast();
  const showDeleteSpeciesPrompt = useDeleteSpeciesPrompt();

  const { sample, subSample } = useSample<Sample>();
  if (!sample || !subSample) return null;

  const deleteFromShallowList = (taxon: Taxon) => {
    const withSamePreferredIdOrWarehouseId = (shallowEntry: Taxon) =>
      doesShallowTaxonMatch(shallowEntry, taxon);

    const taxonIndexInShallowList = subSample.shallowSpeciesList.findIndex(
      withSamePreferredIdOrWarehouseId
    );

    const isNotInShallowList = taxonIndexInShallowList === -1;
    if (isNotInShallowList) return;

    subSample.shallowSpeciesList.splice(taxonIndexInShallowList, 1);
  };

  const deleteSpecies = async (
    taxon: Taxon,
    isShallow: boolean,
    ref: RefObject<HTMLIonItemSlidingElement | null>
  ) => {
    if (isShallow) {
      deleteFromShallowList(taxon);
      await ref.current?.closeOpened();

      return;
    }

    const destroyWrap = () => {
      const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
      const subSamplesMatchingTaxon =
        subSample.occurrences.filter(matchingTaxon);

      const destroy = (occ: Occurrence) => {
        occ.destroy();
        deleteFromShallowList(taxon);
      };
      subSamplesMatchingTaxon.forEach(destroy);
    };

    showDeleteSpeciesPrompt(taxon).then(destroyWrap);
  };

  const increaseCount = (taxa: Taxon, isShallow: boolean, is5x: boolean) => {
    if (isShallow) {
      const survey = subSample.getSurvey();
      const newOccurrence = survey.occ!.create!({ taxon: taxa });

      newOccurrence.createdAt = 0;
      subSample.occurrences.push(newOccurrence);
      subSample.save();
      return;
    }

    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxa);

    const occ = subSample.occurrences.find(matchingTaxon);

    if (!occ) return;

    occ.data.count = (occ.data.count || 0) + (is5x ? 5 : 1);
    occ.save();
  };

  const toggleSpeciesSort = () => {
    toast.success(appModel.cycleSpeciesListSortOrder(), {
      color: 'light',
      position: 'bottom',
      duration: 1000,
    });
  };

  const isDisabled = !!sample.syncedAt;

  const getNextSectionButton = () => {
    if (isDisabled) return null;

    const byCid = ({ cid }: Sample) => cid === subSample.cid;
    const currentSectionIndex = sample.samples.findIndex(byCid);

    const nextSectionIndex = currentSectionIndex + 1;
    const nextSectionSample = sample.samples[nextSectionIndex];
    const isLastSection = !nextSectionSample;
    if (isLastSection) {
      return (
        <HeaderButton onClick={() => goBack()}>common.finish</HeaderButton>
      );
    }

    const nextSectionSampleId = nextSectionSample.cid;

    const navigateToSection = () => {
      navigate(
        `/survey/transect/${sample.cid}/sections/${nextSectionSampleId}`,
        'forward',
        'replace'
      );
    };

    return <HeaderButton onClick={navigateToSection}>common.next</HeaderButton>;
  };

  const getPreviousSectionOrSurvey = () => {
    // Previous Section
    const matchingSectionId = (s: Sample) => s.cid === subSample.cid;
    const currentSectionIndex = sample.samples.findIndex(matchingSectionId);

    const isFirstSection = currentSectionIndex === FIRST_SECTION_INDEX;

    if (!isFirstSection) {
      return sample.samples[currentSectionIndex - 1]?.occurrences || [];
    }

    // Previous Survey
    const sortedSavedSamples = [...samplesCollection]
      .sort(byCreateTime)
      .reverse();

    const matchingSampleId = (s: Sample) => s.cid === sample.cid;
    const currentSampleIndex = sortedSavedSamples.findIndex(matchingSampleId);

    const previousSurveys = sortedSavedSamples
      .slice(0, currentSampleIndex)
      .reverse();

    const matchingSurvey = (s: Sample) => s.getSurvey().name === 'transect';
    const previousSurvey = previousSurveys.find(matchingSurvey);

    return previousSurvey?.samples?.length
      ? previousSurvey.samples[previousSurvey.samples.length - 1].occurrences
      : [];
  };

  const copyPreviousSurveyTaxonList = () => {
    if (sample.metadata.saved) return;

    const previousSectionOrSurvey = getPreviousSectionOrSurvey();
    if (!previousSectionOrSurvey) {
      toast.warn('common.sorryNoPrevious');
      return;
    }

    const getSpeciesId = (occ: Occurrence) =>
      occ.data.taxon.preferredId || occ.data.taxon.warehouseId;
    const existingSpeciesIds = subSample.occurrences.map(getSpeciesId);

    const uniqueSpeciesIds = new Set<number>();
    const getNewSpeciesOnly = ({ warehouseId, preferredId }: Taxon) => {
      const speciesID = preferredId || warehouseId;

      if (uniqueSpeciesIds.has(speciesID)) return false;
      uniqueSpeciesIds.add(speciesID);
      return !existingSpeciesIds.includes(speciesID);
    };

    const getTaxon = (occurrence: Occurrence) => toJS(occurrence.data.taxon);
    const newSpeciesList = previousSectionOrSurvey
      .map(getTaxon)
      .filter(getNewSpeciesOnly);

    // copy but retain old observable ref
    subSample.shallowSpeciesList.splice(
      0,
      subSample.shallowSpeciesList.length,
      ...newSpeciesList
    );

    const speciesNameSort = (sp1: Taxon, sp2: Taxon) =>
      sp1[sp1.foundInName!]?.localeCompare(sp2[sp2.foundInName!] || '') || 0;

    subSample.shallowSpeciesList.sort(speciesNameSort);

    if (!newSpeciesList.length) {
      toast.warn('common.sorryNoSpecies');
    } else {
      toast.success(
        i18n.t('common.haveSuccessfullyCopied', {
          speciesCount: newSpeciesList.length,
        }),
        { skipTranslation: true }
      );
    }
  };

  const navigateToSpeciesOccurrences = (taxon: Taxon) => {
    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
    const occ = subSample.occurrences.find(matchingTaxon);

    if (!occ) return;

    const taxa = occ.data.taxon.warehouseId || occ.data.taxon.preferredId;

    navigate(`${url}/${occ.cid}/${taxa}`);
  };

  const sectionLocation = locations.idMap.get(subSample.data.locationId || '');
  const sectionCode = sectionLocation?.data.code || t('transect.section');

  const { speciesListSortOrder } = appModel.data;
  return (
    <Page id="transect-sections-edit">
      <Header
        title={sectionCode}
        defaultHref="/home/user-surveys"
        skipTranslation
        rightSlot={getNextSectionButton()}
      />
      <Main
        sample={sample}
        subSample={subSample}
        deleteOccurrence={deleteSpecies}
        increaseCount={increaseCount}
        onToggleSpeciesSort={toggleSpeciesSort}
        speciesListSortOrder={speciesListSortOrder}
        isDisabled={isDisabled}
        copyPreviousSurveyTaxonList={copyPreviousSurveyTaxonList}
        navigateToSpeciesOccurrences={navigateToSpeciesOccurrences}
      />
    </Page>
  );
};

export default observer(EditController);
