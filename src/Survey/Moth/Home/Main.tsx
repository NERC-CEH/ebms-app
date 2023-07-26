import { FC, useContext, useRef } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import {
  informationCircle,
  locationOutline,
  camera,
  warningOutline,
  filterOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import {
  Main,
  MenuAttrItem,
  InfoBackgroundMessage,
  useAlert,
  InfoMessage,
  LongPressButton,
} from '@flumens';
import {
  IonList,
  IonButton,
  IonIcon,
  IonLabel,
  NavContext,
  IonItemDivider,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import config from 'common/config';
import Occurrence, { Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import { getUnkownSpecies } from 'Survey/Moth/config';
import IncrementalButton from 'Survey/common/IncrementalButton';
import {
  speciesOccAddedTimeSort,
  speciesNameSort,
  speciesCount,
} from 'Survey/common/taxonSortFunctions';
import UnidentifiedSpeciesEntry from './Components/UnidentifiedSpeciesEntry';
import './styles.scss';

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

const getDefaultTaxonCount = (taxon: Taxon, createdOn?: any) => ({
  count: 0,
  taxon,
  createdOn,
});

const buildSpeciesCount = (agg: any, occ: Occurrence) => {
  const taxon = toJS(occ.attrs.taxon);
  const id = taxon.preferredId || taxon.warehouse_id;

  agg[id] = agg[id] || getDefaultTaxonCount(taxon, occ.metadata.createdOn); // eslint-disable-line

  agg[id].count = toJS(occ.attrs.count); // eslint-disable-line

  return agg;
};

function byCreateTime(occ1: Occurrence, occ2: Occurrence) {
  const date1 = new Date(occ1.metadata.createdOn);
  const date2 = new Date(occ2.metadata.createdOn);
  return date2.getTime() - date1.getTime();
}

type Props = {
  match: any;
  sample: Sample;
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

const HomeMain: FC<Props> = ({
  match,
  sample,
  increaseCount,
  deleteSpecies,
  isDisabled,
  onToggleSpeciesSort,
  photoSelect,
  areaSurveyListSortedByTime,
  useImageIdentifier,
  onIdentifyOccurrence,
  onIdentifyAllOccurrences,
  copyPreviousSurveyTaxonList,
  navigateToSpeciesOccurrences,
}) => {
  const { navigate } = useContext(NavContext);
  const alert = useAlert();
  const ref = useRef();
  const shownDisabledImageIdentifierAlert = useDisabledImageIdentifierAlert();

  const UNKNOWN_SPECIES_PREFFERD_ID = getUnkownSpecies().warehouse_id;

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

  const getSpeciesAddButton = () => {
    const navigateToTaxonSearch = () => {
      navigate(`/survey/moth/${sample.cid}/taxon`);
    };

    const showCopyOptionsWrap = () => {
      if (sample.metadata.saved) return;

      showCopyOptions();
    };

    return (
      <LongPressButton
        color="primary"
        className="add"
        onClick={navigateToTaxonSearch}
        onLongClick={showCopyOptionsWrap}
      >
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </LongPressButton>
    );
  };

  const getSpeciesEntry = ([id, species]: any) => {
    const { taxon } = species;

    const speciesName = taxon[taxon.found_in_name];

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
          <IonLabel>{speciesName}</IonLabel>
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

  const getNewImageButton = () => {
    return (
      <div className="buttons-wrapper">
        {!useImageIdentifier && (
          <div onClick={shownDisabledImageIdentifierAlert}>
            <IonIcon className="alert-icon" icon={warningOutline} />
          </div>
        )}
        <IonButton
          className={clsx(`camera-button`, !useImageIdentifier && 'disabled')}
          type="submit"
          expand="block"
          onClick={photoSelect}
        >
          <IonIcon slot="start" icon={camera} size="large" />
        </IonButton>
      </div>
    );
  };

  const isUnidentifiedSpeciesLengthMoreThanFive = () => {
    const unIdentifiedSpecies = (occ: Occurrence) =>
      occ.media[0] &&
      !occ.media[0]?.attrs?.species &&
      occ.attrs?.taxon.warehouse_id === UNKNOWN_SPECIES_PREFFERD_ID;

    return sample.occurrences.filter(unIdentifiedSpecies).length >= 5;
  };

  const getUndentifiedspeciesList = () => {
    const byUnknownSpecies = (occ: Occurrence) =>
      !occ.attrs.taxon ||
      occ.attrs?.taxon.warehouse_id === UNKNOWN_SPECIES_PREFFERD_ID;

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
      <>
        <IonList id="list" lines="full">
          <div className="rounded">
            <IonItemDivider className="species-list-header unknown">
              <IonLabel
                className={clsx(
                  !isUnidentifiedSpeciesLengthMoreThanFive() && 'full-width'
                )}
              >
                <T>Unknown species</T>
              </IonLabel>
              {!isUnidentifiedSpeciesLengthMoreThanFive() && (
                <IonLabel className="count">{count}</IonLabel>
              )}

              {isUnidentifiedSpeciesLengthMoreThanFive() && (
                <IonButton size="small" onClick={onIdentifyAllOccurrences}>
                  <T>Identify All</T>
                </IonButton>
              )}
            </IonItemDivider>

            {speciesList}
          </div>
        </IonList>
      </>
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const byKnownSpecies = ([, species]: any) => {
      return (
        species.taxon &&
        species.taxon.warehouse_id !== UNKNOWN_SPECIES_PREFFERD_ID
      );
    };

    const speciesCounts = [...sample.occurrences].reduce(buildSpeciesCount, {});

    const getShallowEntry = (shallowEntry: Taxon) => {
      const shallowEntryId =
        shallowEntry.preferredId || shallowEntry.warehouse_id;

      if (speciesCounts[shallowEntryId]) {
        speciesCounts[shallowEntryId].createdOn = 0;
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
          <div className="rounded">
            <IonItemDivider className="species-list-header">
              <IonLabel>
                <T>Count</T>
              </IonLabel>
              <IonLabel>
                <T>Species</T>
              </IonLabel>
              <IonLabel>{count}</IonLabel>
            </IonItemDivider>

            {speciesList}
          </div>
        </IonList>
      </>
    );
  };

  const { webForm } = sample.getSurvey();

  return (
    <Main>
      {isDisabled && (
        <>
          <InfoMessage
            className="blue"
            icon={informationCircle}
            skipTranslation
          >
            <T>
              This record has been submitted and cannot be edited within this
              App.
            </T>
            <IonButton
              href={`${config.backend.url}/${webForm}?sample_id=${sample.id}`}
              expand="block"
              color="dark"
              fill="outline"
              size="small"
              className="website-link"
            >
              <T>eBMS website</T>
            </IonButton>
          </InfoMessage>
        </>
      )}

      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${match.url}/details`}
            icon={locationOutline}
            label="Survey Details"
          />
        </div>
      </IonList>

      {!isDisabled && (
        <div className="buttons-container">
          {getSpeciesAddButton()}

          {getNewImageButton()}
        </div>
      )}

      {getUndentifiedspeciesList()}

      {getSpeciesList()}
    </Main>
  );
};

export default observer(HomeMain);
