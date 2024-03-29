import { FC, useContext, useRef } from 'react';
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
  IonLabel,
  IonItemOptions,
  IonItemOption,
  NavContext,
  IonItemDivider,
} from '@ionic/react';
import PhotoPicker from 'common/Components/PhotoPicker';
import Occurrence, { Taxon } from 'models/occurrence';
import Sample from 'models/sample';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import IncrementalButton from 'Survey/common/IncrementalButton';
import {
  speciesOccAddedTimeSort,
  speciesNameSort,
  speciesCount,
} from 'Survey/common/taxonSortFunctions';
import './styles.scss';

const getDefaultTaxonCount = (taxon: any, createdOn?: any) => ({
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

type Props = {
  sample: Sample;
  subSample: Sample;
  deleteOccurrence: (taxon: Taxon, isShallow: boolean, ref: any) => void;
  navigateToSpeciesOccurrences: any;
  onToggleSpeciesSort: () => void;
  areaSurveyListSortedByTime: boolean;
  increaseCount: any;
  isDisabled: boolean;
  copyPreviousSurveyTaxonList: any;
};

const Edit: FC<Props> = ({
  sample,
  subSample: sectionSample,
  deleteOccurrence,
  onToggleSpeciesSort,
  navigateToSpeciesOccurrences,
  areaSurveyListSortedByTime,
  increaseCount,
  copyPreviousSurveyTaxonList,
  isDisabled,
}) => {
  const alert = useAlert();
  const ref = useRef();
  const match: any = useRouteMatch();

  const { navigate } = useContext(NavContext);

  const getSpeciesEntry = ([id, species]: [string, any]) => {
    const isSpeciesDisabled = !species.count;
    const { taxon } = species;

    const speciesName = taxon[taxon.found_in_name];

    const matchingTaxon = (occ: Occurrence) => occ.doesTaxonMatch(taxon);
    const isShallow = !sectionSample.occurrences.filter(matchingTaxon).length;

    const increaseCountWrap = () => increaseCount(taxon, isShallow);
    const increase5xCountWrap = () => increaseCount(taxon, isShallow, true);

    const navigateToOccurrence = () => navigateToSpeciesOccurrences(taxon);

    const deleteSpeciesWrap = () => deleteOccurrence(taxon, isShallow, ref);

    return (
      <IonItemSliding key={id} ref={ref as any}>
        <IonItem detail={!isSpeciesDisabled} onClick={navigateToOccurrence}>
          <IncrementalButton
            onClick={increaseCountWrap}
            onLongClick={increase5xCountWrap}
            value={species.count}
            disabled={isDisabled}
          />
          <IonLabel className="title">{speciesName}</IonLabel>
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

  const getSpeciesList = () => {
    if (
      !sectionSample.occurrences.length &&
      !sectionSample.shallowSpeciesList.length
    ) {
      return <InfoBackgroundMessage>No species added</InfoBackgroundMessage>;
    }

    const speciesCounts = [...sectionSample.occurrences].reduce(
      buildSpeciesCount,
      {}
    );

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

    const shallowCounts = sectionSample.shallowSpeciesList
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
        startAddon={<IonIcon src={addCircleOutline} className="size-7" />}
      >
        Add species
      </Button>
    );
  };

  const { reliability } = sectionSample.attrs;

  const baseURL = `/survey/transect/${sample.cid}/sections/${sectionSample.cid}`;

  return (
    <Main id="transect-section-edit">
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${baseURL}/reliability`}
            disabled={isDisabled}
            icon={thumbsUpOutline}
            label="Reliability"
            value={reliability}
          />

          <MenuAttrItemFromModel
            attr="comment"
            model={sectionSample}
            skipValueTranslation
          />
        </div>

        <IonItemDivider>
          <T>Section Photos</T>
        </IonItemDivider>
        <div className="rounded">
          <PhotoPicker model={sectionSample} />
        </div>

        {getSpeciesAddButton()}
      </IonList>

      {getSpeciesList()}
    </Main>
  );
};

export default observer(Edit);
