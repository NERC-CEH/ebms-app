import { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { useRouteMatch } from 'react-router';
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
import {
  addCircleOutline,
  filterOutline,
  thumbsUpOutline,
  cloudyOutline,
} from 'ionicons/icons';
import { Main, MenuAttrItem, MenuAttrItemFromModel } from '@flumens';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import PhotoPicker from 'common/Components/PhotoPicker';
import IncrementalButton from 'Survey/common/IncrementalButton';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

const speciesNameSort = (occ1: Occurrence, occ2: Occurrence) => {
  const foundInName1 = occ1.attrs.taxon.found_in_name;
  const foundInName2 = occ2.attrs.taxon.found_in_name;
  const taxon1 = occ1.attrs.taxon[foundInName1];
  const taxon2 = occ2.attrs.taxon[foundInName2];
  return taxon1.localeCompare(taxon2);
};

const speciesOccAddedTimeSort = (occ1: Occurrence, occ2: Occurrence) => {
  const date1 = new Date(occ1.metadata.updated_on);
  const date2 = new Date(occ2.metadata.updated_on);
  return date2.getTime() - date1.getTime();
};

type Props = {
  sample: Sample;
  subSample: Sample;
  deleteOccurrence: (occ: Occurrence) => void;
  onToggleSpeciesSort: () => void;
  areaSurveyListSortedByTime: boolean;
  increaseCount: any;
  isDisabled: boolean;
};

const Edit: FC<Props> = ({
  sample,
  subSample: sectionSample,
  deleteOccurrence,
  onToggleSpeciesSort,
  areaSurveyListSortedByTime,
  increaseCount,

  isDisabled,
}) => {
  const match: any = useRouteMatch();

  const { navigate } = useContext(NavContext);

  const getSpeciesList = (sample: Sample) => {
    if (!sample.occurrences.length) {
      return (
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      );
    }

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const occurrences = [...sample.occurrences].sort(sort);

    const getOccurrenceEntry = (occ: Occurrence) => {
      const speciesName = occ.getTaxonName();
      const { count } = occ.attrs;

      const deleteOccurrenceWrap = () => deleteOccurrence(occ);

      const increaseCountWrap = () => increaseCount(occ);
      const increase5xCountWrap = () => increaseCount(occ, true);

      return (
        <IonItemSliding key={occ.cid}>
          <IonItem routerLink={`${match.url}/${occ.cid}/edit`} detail>
            <IncrementalButton
              onClick={increaseCountWrap}
              onLongClick={increase5xCountWrap}
              value={count}
              disabled={isDisabled}
            />
            <IonLabel>{speciesName}</IonLabel>
          </IonItem>

          {!isDisabled && (
            <IonItemOptions side="end">
              <IonItemOption color="danger" onClick={deleteOccurrenceWrap}>
                <T>Delete</T>
              </IonItemOption>
            </IonItemOptions>
          )}
        </IonItemSliding>
      );
    };

    const speciesListLength = sample.occurrences.length;

    const count = speciesListLength > 1 ? speciesListLength : null;

    const speciesList = occurrences.map(getOccurrenceEntry);

    return (
      <>
        <div id="species-list-sort">
          <IonButton fill="clear" size="small" onClick={onToggleSpeciesSort}>
            <IonIcon icon={filterOutline} mode="md" />
          </IonButton>
        </div>

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

  const getSpeciesAddButton = () => {
    const sectionSampleId = match.params.subSmpId;
    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    const onClick = () =>
      navigate(
        `/survey/transect/${sample.cid}/edit/sections/${sectionSampleId}/taxa`
      );

    return (
      <IonButton color="primary" id="add" onClick={onClick}>
        <IonIcon icon={addCircleOutline} slot="start" />
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </IonButton>
    );
  };

  const { cloud } = sectionSample.attrs;
  const { reliability } = sectionSample.attrs;

  const baseURL = `/survey/transect/${sample.cid}/edit/sections/${sectionSample.cid}`;

  return (
    <Main id="transect-section-edit">
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon={cloudyOutline}
            label="Cloud"
            value={cloud}
            skipValueTranslation
          />

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

      {getSpeciesList(sectionSample)}
    </Main>
  );
};

export default observer(Edit);
