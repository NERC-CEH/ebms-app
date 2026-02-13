import { useContext, useRef } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  locationOutline,
  camera,
  filterOutline,
  addCircleOutline,
  images,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, MenuAttrItem, useAlert, Button } from '@flumens';
import {
  IonList,
  IonButton,
  IonIcon,
  NavContext,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import Occurrence, { Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { getUnknownSpecies } from 'Survey/MothTrap/config';
import IncrementalButton from 'Survey/common/IncrementalButton';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import UploadedRecordInfoMessage from 'Survey/common/UploadedRecordInfoMessage';
import {
  speciesOccAddedTimeSort,
  speciesNameSort,
  speciesCount,
} from 'Survey/common/taxonSortFunctions';
import UnidentifiedSpeciesEntry from './UnidentifiedSpeciesEntry';

function useDisabledImageIdentifierAlert() {
  const alert = useAlert();

  const shownDisabledImageIdentifierAlert = () =>
    alert({
      header: 'Image identification',
      message: (
        <T>
          Image classifier is currently <b>disabled</b>. Please go to app{' '}
          <b>Settings</b> to turn it on.
        </T>
      ),
      buttons: [
        {
          text: 'OK, got it',
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });

  return shownDisabledImageIdentifierAlert;
}

const getDefaultTaxonCount = (taxon: Taxon, createdAt?: any) => ({
  count: 0,
  taxon,
  createdAt,
});

const buildSpeciesCount = (agg: any, occ: Occurrence) => {
  const taxon = toJS(occ.data.taxon);
  const id = taxon.preferredId || taxon.warehouseId;

  agg[id] = agg[id] || getDefaultTaxonCount(taxon, occ.createdAt); // eslint-disable-line

  agg[id].count = toJS(occ.data.count); // eslint-disable-line

  return agg;
};

function byCreateTime(occ1: Occurrence, occ2: Occurrence) {
  const date1 = new Date(occ1.createdAt);
  const date2 = new Date(occ2.createdAt);
  return date2.getTime() - date1.getTime();
}

type Props = {
  match: any;
  sample: Sample;
  cameraSelect: any;
  photoSelect: any;
  increaseCount: any;
  deleteSpecies: any;
  onToggleSpeciesSort: any;
  isDisabled: boolean;
  useImageIdentifier: boolean;
  onIdentifyOccurrence: any;
  areaSurveyListSortedByTime: boolean;
  onIdentifyAllOccurrences: any;
  copyPreviousSurveyTaxonList: any;
  navigateToSpeciesOccurrences: any;
};

const HomeMain = ({
  match,
  sample,
  increaseCount,
  deleteSpecies,
  isDisabled,
  onToggleSpeciesSort,
  cameraSelect,
  photoSelect,
  areaSurveyListSortedByTime,
  useImageIdentifier,
  onIdentifyOccurrence,
  onIdentifyAllOccurrences,
  copyPreviousSurveyTaxonList,
  navigateToSpeciesOccurrences,
}: Props) => {
  const { navigate } = useContext(NavContext);
  const alert = useAlert();
  const ref = useRef<any>(null);
  const shownDisabledImageIdentifierAlert = useDisabledImageIdentifierAlert();

  const UNKNOWN_SPECIES_PREFFERD_ID = getUnknownSpecies().warehouseId;

  const showCopyOptions = () => {
    alert({
      header: 'Copy species',
      message: 'Are you sure want to copy previous survey species list?',
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Copy',
          cssClass: 'danger',
          handler: copyPreviousSurveyTaxonList,
        },
      ],
    });
  };

  const navigateToTaxonSearch = () => {
    navigate(`/survey/moth/${sample.cid}/taxon`);
  };

  const showCopyOptionsWrap = () => {
    if (sample.metadata.saved) return;

    showCopyOptions();
  };

  const getSpeciesEntry = ([id, species]: any) => {
    const { taxon } = species;

    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);

    const isShallow = !sample.occurrences.filter(matchingTaxon).length;

    const increaseCountWrap = () => increaseCount(taxon, isShallow);

    const increase5xCountWrap = () => increaseCount(taxon, isShallow, true);

    const deleteSpeciesWrap = () => deleteSpecies(taxon, isShallow, ref);

    const navigateToOccurrence = () => navigateToSpeciesOccurrences(taxon);

    return (
      <IonItemSliding key={id} ref={ref as any}>
        <IonItem detail={!isDisabled} onClick={navigateToOccurrence}>
          <IncrementalButton
            onClick={increaseCountWrap}
            onLongClick={increase5xCountWrap}
            value={species.count}
            disabled={isDisabled}
          />
          <div className="my-2 mx-3">
            <TaxonPrettyName taxon={taxon} />
          </div>
        </IonItem>
        {!isDisabled && (
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteSpeciesWrap}>
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  const isUnidentifiedSpeciesLengthMoreThanFive = () => {
    const unIdentifiedSpecies = (occ: Occurrence) =>
      occ.media[0] &&
      !occ.media[0]?.data?.species &&
      occ.data?.taxon.warehouseId === UNKNOWN_SPECIES_PREFFERD_ID;

    return sample.occurrences.filter(unIdentifiedSpecies).length >= 5;
  };

  const getUndentifiedspeciesList = () => {
    const byUnknownSpecies = (occ: Occurrence) =>
      !occ.data.taxon ||
      occ.data?.taxon.warehouseId === UNKNOWN_SPECIES_PREFFERD_ID;

    const getUnidentifiedSpeciesEntry = (occ: Occurrence) => (
      <UnidentifiedSpeciesEntry
        key={occ.cid}
        occ={occ}
        isDisabled={isDisabled}
        onIdentify={onIdentifyOccurrence}
        isUnidentifiedSpeciesLengthMoreThanFive={isUnidentifiedSpeciesLengthMoreThanFive()}
      />
    );
    const speciesList = sample.occurrences
      .filter(byUnknownSpecies)
      .sort(byCreateTime)
      .map(getUnidentifiedSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    if (speciesList.length < 1) return null;

    return (
      <IonList id="list" lines="full">
        <div className="rounded-list">
          <div className="list-divider">
            <div
              className={clsx(
                !isUnidentifiedSpeciesLengthMoreThanFive() && 'full-width'
              )}
            >
              <T>Unknown species</T>
            </div>
            {!isUnidentifiedSpeciesLengthMoreThanFive() && (
              <div className="count">{count}</div>
            )}

            {isUnidentifiedSpeciesLengthMoreThanFive() && (
              <Button
                onPress={onIdentifyAllOccurrences}
                color="secondary"
                className="py-1 text-sm"
              >
                <T>Identify All</T>
              </Button>
            )}
          </div>

          {speciesList}
        </div>
      </IonList>
    );
  };

  const getSpeciesList = () => {
    if (!sample.occurrences.length && !sample.shallowSpeciesList.length) {
      return (
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      );
    }
    const byKnownSpecies = ([, species]: any) =>
      species.taxon &&
      species.taxon.warehouseId !== UNKNOWN_SPECIES_PREFFERD_ID;

    const speciesCounts = [...sample.occurrences].reduce(buildSpeciesCount, {});

    const getShallowEntry = (shallowEntry: Taxon) => {
      const shallowEntryId =
        shallowEntry.preferredId || shallowEntry.warehouseId;

      if (speciesCounts[shallowEntryId]) {
        speciesCounts[shallowEntryId].createdAt = 0;
        return null;
      }

      return getDefaultTaxonCount(shallowEntry, 0);
    };

    const notEmpty = (shallowEntry: any) => shallowEntry;

    const shallowCounts = sample.shallowSpeciesList
      .map(getShallowEntry)
      .filter(notEmpty);

    const counts = {
      ...speciesCounts,
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...shallowCounts,
    };

    let sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    if (isDisabled) {
      sort = speciesCount;
    }

    const speciesList = Object.entries(counts)
      .filter(byKnownSpecies)
      .sort(sort)
      .map(getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

    if (!speciesList.length) return null;

    return (
      <>
        {!isDisabled && (
          <div id="species-list-sort">
            <IonButton fill="clear" size="small" onClick={onToggleSpeciesSort}>
              <IonIcon icon={filterOutline} mode="md" />
            </IonButton>
          </div>
        )}

        <IonList id="list" lines="full">
          <div className="rounded-list">
            <div className="list-divider gap-4">
              <div>
                <T>Count</T>
              </div>
              <div className="flex w-full justify-between">
                <div>
                  <T>Species</T>
                </div>
                <div>{count}</div>
              </div>
            </div>

            {speciesList}
          </div>
        </IonList>
      </>
    );
  };

  return (
    <Main>
      {isDisabled && <UploadedRecordInfoMessage sample={sample} />}

      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${match.url}/details`}
            icon={locationOutline}
            label="Survey Details"
          />
        </div>
      </IonList>

      {!isDisabled && (
        <div className="mx-5 my-8 flex items-center justify-center gap-4">
          <Button
            color="primary"
            className="py-2"
            onPress={navigateToTaxonSearch}
            onLongPress={showCopyOptionsWrap}
            prefix={<IonIcon src={addCircleOutline} className="size-5" />}
          >
            Add species
          </Button>

          <Button
            color="tertiary"
            className={clsx(
              'shrink-0 py-2',
              !useImageIdentifier && 'opacity-40'
            )}
            onPress={
              useImageIdentifier
                ? cameraSelect
                : shownDisabledImageIdentifierAlert
            }
          >
            <IonIcon icon={camera} className="size-6" />
          </Button>

          <Button
            color="tertiary"
            className={clsx(
              'shrink-0 py-2',
              !useImageIdentifier && 'opacity-40'
            )}
            onPress={
              useImageIdentifier
                ? photoSelect
                : shownDisabledImageIdentifierAlert
            }
          >
            <IonIcon icon={images} className="size-6" />
          </Button>
        </div>
      )}

      {getUndentifiedspeciesList()}

      {getSpeciesList()}
    </Main>
  );
};

export default observer(HomeMain);
