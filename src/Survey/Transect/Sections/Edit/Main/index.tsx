import { useContext, useRef, type RefObject } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import {
  addCircleOutline,
  filterOutline,
  thumbsUpOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Main,
  MenuAttrItem,
  MenuAttrItemFromModel,
  useAlert,
  Button,
} from '@flumens';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonButton,
  IonIcon,
  IonItemOptions,
  IonItemOption,
  NavContext,
} from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import type { SpeciesListSortOrder } from 'models/app';
import Occurrence, { Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import IncrementalButton from 'Survey/common/IncrementalButton';
import TaxonPrettyName from 'Survey/common/TaxonPrettyName';
import {
  speciesOccAddedTimeSort,
  speciesOccUpdatedTimeSort,
  speciesNameSort,
  speciesCount,
  getDefaultTaxonCount,
  SpeciesSummary,
} from 'Survey/common/taxonSortFunctions';
import './styles.scss';

type SpeciesCounts = Record<number, SpeciesSummary>;

const buildSpeciesCount = (agg: SpeciesCounts, occ: Occurrence) => {
  const taxon = toJS(occ.data.taxon);
  const id = taxon.preferredId || taxon.warehouseId;

  if (!agg[id])
    agg[id] = getDefaultTaxonCount(taxon, occ.createdAt, occ.updatedAt);

  if ((agg[id].updatedAt || 0) < occ.updatedAt)
    agg[id].updatedAt = occ.updatedAt;

  agg[id].count = toJS(occ.data.count) || 0;

  return agg;
};

type Props = {
  sample: Sample;
  subSample: Sample;
  deleteOccurrence: (
    taxon: Taxon,
    isShallow: boolean,
    ref: RefObject<HTMLIonItemSlidingElement | null>
  ) => void;
  navigateToSpeciesOccurrences: (taxon: Taxon) => void;
  onToggleSpeciesSort: () => void;
  speciesListSortOrder: SpeciesListSortOrder;
  increaseCount: (taxon: Taxon, isShallow: boolean, is5x: boolean) => void;
  isDisabled: boolean;
  copyPreviousSurveyTaxonList: () => void;
};

const Edit = ({
  sample,
  subSample: sectionSample,
  deleteOccurrence,
  onToggleSpeciesSort,
  navigateToSpeciesOccurrences,
  speciesListSortOrder,
  increaseCount,
  copyPreviousSurveyTaxonList,
  isDisabled,
}: Props) => {
  const alert = useAlert();
  const ref = useRef<HTMLIonItemSlidingElement>(null);
  const match = useRouteMatch<{ subSmpId: string }>();

  const { navigate } = useContext(NavContext);

  const getSpeciesEntry = ([id, species]: [string, SpeciesSummary]) => {
    const isSpeciesDisabled = !species.count;
    const { taxon } = species;

    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
    const isShallow = !sectionSample.occurrences.filter(matchingTaxon).length;

    const increaseCountWrap = () => increaseCount(taxon, isShallow, false);
    const increase5xCountWrap = () => increaseCount(taxon, isShallow, true);

    const navigateToOccurrence = () => navigateToSpeciesOccurrences(taxon);

    const deleteSpeciesWrap = () => deleteOccurrence(taxon, isShallow, ref);

    return (
      <IonItemSliding key={id} ref={ref}>
        <IonItem detail={!isSpeciesDisabled} onClick={navigateToOccurrence}>
          <IncrementalButton
            onClick={increaseCountWrap}
            onLongClick={increase5xCountWrap}
            value={species.count}
            disabled={isDisabled}
          />
          <div className="my-2 mx-3">
            <TaxonPrettyName {...taxon} />
          </div>
        </IonItem>

        {!isDisabled && (
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteSpeciesWrap}>
              <T>common.delete</T>
            </IonItemOption>
          </IonItemOptions>
        )}
      </IonItemSliding>
    );
  };

  const getSpeciesList = () => {
    if (
      !sectionSample.occurrences.length &&
      !sectionSample.shallowSpeciesList.length
    ) {
      return (
        <InfoBackgroundMessage>common.noSpeciesAdded</InfoBackgroundMessage>
      );
    }

    const speciesCounts = [...sectionSample.occurrences].reduce(
      buildSpeciesCount,
      {}
    );

    const getShallowEntry = (shallowEntry: Taxon) => {
      const shallowEntryId =
        shallowEntry.preferredId || shallowEntry.warehouseId;

      if (speciesCounts[shallowEntryId]) {
        speciesCounts[shallowEntryId].createdAt = 0;
        return null;
      }

      return getDefaultTaxonCount(shallowEntry, 0);
    };

    const shallowCounts = sectionSample.shallowSpeciesList
      .map(getShallowEntry)
      .filter(shallowEntry => !!shallowEntry);

    const counts = Object.assign(
      {} as Record<string, SpeciesSummary>,
      speciesCounts,
      shallowCounts
    );

    let sort = speciesNameSort;

    if (speciesListSortOrder === 'lastAdded') sort = speciesOccAddedTimeSort;

    if (speciesListSortOrder === 'lastEdited') sort = speciesOccUpdatedTimeSort;

    if (isDisabled) {
      sort = speciesCount;
    }

    const speciesList = Object.entries(counts).sort(sort).map(getSpeciesEntry);

    const count = speciesList.length > 1 ? speciesList.length : null;

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
                <T>common.count</T>
              </div>
              <div className="flex w-full justify-between">
                <div>
                  <T>common.species</T>
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
  const showCopyOptions = () => {
    alert({
      header: 'common.copySpecies',
      message: 'common.sureWantCopy',
      buttons: [
        { text: 'common.cancel' },
        {
          text: 'common.copy',
          role: 'destructive',
          handler: copyPreviousSurveyTaxonList,
        },
      ],
    });
  };

  const getSpeciesAddButton = () => {
    const sectionSampleId = match.params.subSmpId;
    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    const onClick = () =>
      navigate(
        `/survey/transect/${sample.cid}/sections/${sectionSampleId}/taxa`
      );

    const showCopyOptionsWrap = () => {
      if (sample.metadata.saved) return;

      showCopyOptions();
    };

    return (
      <Button
        color="primary"
        className="mx-auto mt-10"
        onPress={onClick}
        onLongPress={showCopyOptionsWrap}
        prefix={<IonIcon src={addCircleOutline} className="size-5" />}
      >
        common.addSpecies
      </Button>
    );
  };

  const { reliability } = sectionSample.data;

  const baseURL = `/survey/transect/${sample.cid}/sections/${sectionSample.cid}`;

  return (
    <Main id="transect-section-edit" className="pb-ion-s-10">
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`${baseURL}/reliability`}
            disabled={isDisabled}
            icon={thumbsUpOutline}
            label="transect.reliability"
            value={reliability}
          />

          <MenuAttrItemFromModel
            attr="comment"
            model={sectionSample}
            skipValueTranslation
          />
        </div>

        <h3 className="list-title">
          <T>transect.sectionPhotos</T>
        </h3>
        <div className="rounded-list">
          <PhotoPicker model={sectionSample} />
        </div>

        {getSpeciesAddButton()}
      </IonList>

      {getSpeciesList()}
    </Main>
  );
};

export default observer(Edit);
