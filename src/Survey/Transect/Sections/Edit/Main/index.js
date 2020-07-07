import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonButton,
  IonIcon,
  IonLabel,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { addCircleOutline, removeCircleOutline, funnel } from 'ionicons/icons';
import { Main, MenuAttrItem } from '@apps';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import InfoBackgroundMessage from 'Lib/InfoBackgroundMessage';
import 'common/images/cloud.svg';
import './thumb-up.svg';
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
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    deleteOccurrence: PropTypes.func.isRequired,
    onToggleSpeciesSort: PropTypes.func.isRequired,
    areaSurveyListSortedByTime: PropTypes.bool.isRequired,
    increaseCount: PropTypes.func.isRequired,
    decreaseCount: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
  };

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

    return (
      <Main id="transect-section-edit">
        <div id="species-list-sort">
          <IonButton
            fill="clear"
            size="small"
            onClick={this.props.onToggleSpeciesSort}
          >
            <IonIcon icon={funnel} mode="md" />
          </IonButton>
        </div>

        <IonList id="list" lines="full">
          {occurrences.map(occ => (
            <IonItemSliding key={occ.cid}>
              <IonItem>
                {!isDisabled && (
                  <IonButton onClick={() => decreaseCount(occ)} fill="clear">
                    <IonIcon icon={removeCircleOutline} slot="icon-only" />
                  </IonButton>
                )}
                <IonButton class="transect-edit-count" fill="clear">
                  {occ.attrs.count}
                </IonButton>

                {!isDisabled && (
                  <IonButton onClick={() => increaseCount(occ)} fill="clear">
                    <IonIcon icon={addCircleOutline} slot="icon-only" />
                  </IonButton>
                )}

                <IonLabel>
                  {occ.attrs.taxon[occ.attrs.taxon.found_in_name]}
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                  color="danger"
                  onClick={() => deleteOccurrence(occ)}
                >
                  <T>Delete</T>
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
      </Main>
    );
  }

  getSpeciesAddButton = () => {
    const { history, match, sample, isDisabled } = this.props;
    const sectionSampleId = match.params.sectionId;
    if (isDisabled) {
      // placeholder
      return <div style={{ height: '44px' }} />;
    }

    return (
      <IonButton
        color="primary"
        id="add"
        onClick={() => {
          history.push(
            `/survey/transect/${sample.cid}/edit/sections/${sectionSampleId}/taxa`
          );
        }}
      >
        <IonIcon icon={addCircleOutline} slot="start" />
        <IonLabel>
          <T>Add species</T>
        </IonLabel>
      </IonButton>
    );
  };

  render() {
    const { sample, match, isDisabled } = this.props;
    const sectionSampleId = match.params.sectionId;

    const sectionSample = sample.getSectionSample(sectionSampleId);
    const { cloud } = sectionSample.attrs;
    const { reliability } = sectionSample.attrs;

    const baseURL = `/survey/transect/${sample.cid}/edit/sections/${sectionSampleId}`;

    return (
      <Main id="area-count-edit">
        <IonList lines="full">
          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon="/images/cloud.svg"
            label="Cloud"
            value={cloud}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/reliability`}
            disabled={isDisabled}
            icon="/images/thumb-up.svg"
            label="Reliability"
            value={t(reliability)}
          />

          {this.getSpeciesAddButton()}
        </IonList>

        {this.getSpeciesList(sectionSample)}
      </Main>
    );
  }
}

export default Edit;
