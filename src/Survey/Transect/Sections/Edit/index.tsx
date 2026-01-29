import { useContext } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Page, Header, useAlert, useToast, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
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
    const prompt = (resolve: any) => {
      const taxonName = taxon.scientific_name;
      alert({
        header: t('Delete'),
        skipTranslation: true,
        message: t('Are you sure you want to delete {{taxon}} ?', {
          taxon: taxonName,
        }),
        buttons: [
          {
            text: t('Cancel'),
            role: 'cancel',
          },
          {
            text: t('Delete'),
            role: 'destructive',
            handler: resolve,
          },
        ],
      });
    };

    return new Promise(prompt);
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

  const deleteSpecies = async (taxon: any, isShallow: boolean, ref: any) => {
    if (isShallow) {
      deleteFromShallowList(taxon);
      await ref.current.closeOpened();

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
      const newOccurrence = survey.occ!.create!({ Occurrence, taxon: taxa });

      newOccurrence.createdAt = 0;
      subSample.occurrences.push(newOccurrence);
      subSample.save();
      return;
    }

    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxa);

    const occ = subSample.occurrences.find(matchingTaxon);

    if (!occ) return;

    occ.data.count += is5x ? 5 : 1;
    occ.save();
  };

  const toggleSpeciesSort = () => {
    const { areaSurveyListSortedByTime } = appModel.data;
    const newSort = !areaSurveyListSortedByTime;
    appModel.data.areaSurveyListSortedByTime = newSort;
    appModel.save();

    const prettySortName = appModel.data.areaSurveyListSortedByTime
      ? 'last added'
      : 'alphabetical';

    toast.success(`Changed list ordering to ${prettySortName}.`, {
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
      return <HeaderButton onClick={() => goBack()}>Finish</HeaderButton>;
    }

    const nextSectionSampleId = nextSectionSample.cid;

    const navigateToSection = () => {
      navigate(
        `/survey/transect/${sample.cid}/sections/${nextSectionSampleId}`,
        'forward',
        'replace'
      );
    };

    return <HeaderButton onClick={navigateToSection}>Next</HeaderButton>;
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
      toast.warn('Sorry, no previous survey to copy species from.');
      return;
    }

    const getSpeciesId = (occ: Occurrence) =>
      occ.data.taxon.preferredId || occ.data.taxon.warehouse_id;
    const existingSpeciesIds = subSample.occurrences.map(getSpeciesId);

    const uniqueSpeciesList: any = [];
    const getNewSpeciesOnly = ({ warehouse_id, preferredId }: any) => {
      const speciesID = preferredId || warehouse_id;

      if (uniqueSpeciesList.includes(speciesID)) {
        return false;
      }
      uniqueSpeciesList.push(speciesID);
      return !existingSpeciesIds.includes(speciesID);
    };

    const getTaxon = (occurrence: Occurrence) => toJS(occurrence.data.taxon);
    const newSpeciesList = previousSectionOrSurvey
      .map(getTaxon)
      .filter(getNewSpeciesOnly) as [];

    // copy but retain old observable ref
    subSample.shallowSpeciesList.splice(
      0,
      subSample.shallowSpeciesList.length,
      ...newSpeciesList
    );

    const speciesNameSort = (sp1: any, sp2: any) => {
      const taxon1 = sp1.found_in_name;
      const taxonName1 = sp1[taxon1];

      const taxon2 = sp2.found_in_name;
      const taxonName2 = sp2[taxon2];

      return taxonName1.localeCompare(taxonName2);
    };

    subSample.shallowSpeciesList.sort(speciesNameSort);

    if (!newSpeciesList.length) {
      toast.warn('Sorry, no species were found to copy.');
    } else {
      toast.success(
        i18n.t('You have successfully copied {{speciesCount}} species.', {
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

    const taxa = occ.data.taxon.warehouse_id || occ.data.taxon.preferredId;

    navigate(`${url}/${occ.cid}/${taxa}`);
  };

  const sectionLocation = subSample.data.location!;
  const sectionCode =
    ('code' in sectionLocation && sectionLocation.code) || t('Section');

  const { areaSurveyListSortedByTime } = appModel.data;
  return (
    <Page id="transect-sections-edit">
      <Header
        title={sectionCode}
        defaultHref="/home/user-surveys"
        rightSlot={getNextSectionButton()}
      />
      <Main
        sample={sample}
        subSample={subSample}
        deleteOccurrence={deleteSpecies}
        increaseCount={increaseCount}
        onToggleSpeciesSort={toggleSpeciesSort}
        areaSurveyListSortedByTime={areaSurveyListSortedByTime}
        isDisabled={isDisabled}
        copyPreviousSurveyTaxonList={copyPreviousSurveyTaxonList}
        navigateToSpeciesOccurrences={navigateToSpeciesOccurrences}
      />
    </Page>
  );
};

export default observer(EditController);
