import { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
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
} from '@ionic/react';
import {
  addCircleOutline,
  removeCircleOutline,
  filterOutline,
  thumbsUpOutline,
  cloudyOutline,
} from 'ionicons/icons';
import { Main, MenuAttrItem } from '@flumens';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

const speciesNameSort = (occ1, occ2) => {
  const foundInName1 = occ1.attrs.taxon.found_in_name;
  const foundInName2 = occ2.attrs.taxon.found_in_name;
  const taxon1 = occ1.attrs.taxon[foundInName1];
  const taxon2 = occ2.attrs.taxon[foundInName2];
  return taxon1.localeCompare(taxon2);
};

const speciesOccAddedTimeSort = (occ1, occ2) => {
  const date1 = new Date(occ1.metadata.updated_on);
  const date2 = new Date(occ2.metadata.updated_on);
  return date2.getTime() - date1.getTime();
};

@observer
class Edit extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    subSample: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    deleteOccurrence: PropTypes.func.isRequired,
    onToggleSpeciesSort: PropTypes.func.isRequired,
    areaSurveyListSortedByTime: PropTypes.bool.isRequired,
    increaseCount: PropTypes.func.isRequired,
    decreaseCount: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
  };

  static contextType = NavContext;

  getSpeciesList(sample) {
    const { isDisabled } = this.props;

    if (!sample.occurrences.length) {
      return (
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
        </IonList>
      );
    }
    const {
      deleteOccurrence,
      areaSurveyListSortedByTime,
      increaseCount,
      decreaseCount,
    } = this.props;

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const occurrences = [...sample.occurrences].sort(sort);

    const occurrenceEntry = occ => {
      const decreaseCountWrap = () => decreaseCount(occ);
      const increaseCountWrap = () => increaseCount(occ);
      const deleteOccurrenceWrap = () => deleteOccurrence(occ);

      return (
        <IonItemSliding key={occ.cid}>
          <IonItem>
            {!isDisabled && (
              <IonButton onClick={decreaseCountWrap} fill="clear">
                <IonIcon icon={removeCircleOutline} slot="icon-only" />
              </IonButton>
            )}
            <IonButton class="transect-edit-count" fill="clear">
              {occ.attrs.count}
            </IonButton>

            {!isDisabled && (
              <IonButton onClick={increaseCountWrap} fill="clear">
                <IonIcon icon={addCircleOutline} slot="icon-only" />
              </IonButton>
            )}

            <IonLabel>
              {occ.attrs.taxon[occ.attrs.taxon.found_in_name]}
            </IonLabel>
          </IonItem>
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteOccurrenceWrap}>
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    };

    return (
      <Main id="transect-section-edit">
        <div id="species-list-sort">
          <IonButton
            fill="clear"
            size="small"
            onClick={this.props.onToggleSpeciesSort}
          >
            <IonIcon icon={filterOutline} mode="md" />
          </IonButton>
        </div>

        <IonList id="list" lines="full">
          <div className="rounded">{occurrences.map(occurrenceEntry)}</div>
        </IonList>
      </Main>
    );
  }

  getSpeciesAddButton = () => {
    const { match, sample, isDisabled } = this.props;
    const sectionSampleId = match.params.subSmpId;
    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    const onClick = () => {
      this.context.navigate(
        `/survey/transect/${sample.cid}/edit/sections/${sectionSampleId}/taxa`
      );
    };

    return (
      <IonButton color="primary" id="add" onClick={onClick}>
        <IonIcon icon={addCircleOutline} slot="start" />
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </IonButton>
    );
  };

  render() {
    const { sample, subSample: sectionSample, isDisabled } = this.props;

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
          </div>

          {this.getSpeciesAddButton()}
        </IonList>

        {this.getSpeciesList(sectionSample)}
      </Main>
    );
  }
}

export default withRouter(Edit);
