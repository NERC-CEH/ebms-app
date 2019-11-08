import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonButton,
  IonIcon,
  IonLabel,
  IonContent,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { addCircleOutline, removeCircleOutline, funnel } from 'ionicons/icons';
import { observer } from 'mobx-react';
import 'common/images/cloud.svg';
import './thumb-up.svg';
import './styles.scss';

const speciesNameSort = (occ1, occ2) => {
  const foundInName1 = occ1.get('taxon').found_in_name;
  const foundInName2 = occ2.get('taxon').found_in_name;
  const taxon1 = occ1.get('taxon')[foundInName1];
  const taxon2 = occ2.get('taxon')[foundInName2];
  return taxon1.localeCompare(taxon2);
};

const speciesOccAddedTimeSort = (occ1, occ2) => {
  const date1 = new Date(occ1.metadata.updated_on);
  const date2 = new Date(occ2.metadata.updated_on);
  return date2.getTime() - date1.getTime();
};

@observer
class AreaCount extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    deleteOccurrence: PropTypes.func.isRequired,
    onToggleSpeciesSort: PropTypes.func.isRequired,
    areaSurveyListSortedByTime: PropTypes.bool.isRequired,
    increaseCount: PropTypes.func.isRequired,
    decreaseCount: PropTypes.func.isRequired,
  };

  getSpeciesList(sample) {
    if (!sample.occurrences.models.length) {
      return (
        <IonList id="list" lines="full">
          <IonItem className="empty">
            <span>{t('No species added')}</span>
          </IonItem>
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

    const occurrences = [...sample.occurrences.models].sort(sort);

    return (
      <IonContent id="transect-section-edit">
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
                <IonButton onClick={() => decreaseCount(occ)} fill="clear">
                  <IonIcon icon={removeCircleOutline} slot="icon-only" />
                </IonButton>
                <IonButton class="transect-edit-count" fill="clear">
                  {occ.get('count')}
                </IonButton>

                <IonButton onClick={() => increaseCount(occ)} fill="clear">
                  <IonIcon icon={addCircleOutline} slot="icon-only" />
                </IonButton>
                <IonLabel>
                  {occ.get('taxon')[occ.get('taxon').found_in_name]}
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                  color="danger"
                  onClick={() => deleteOccurrence(occ)}
                >
                  {t('Delete')}
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
      </IonContent>
    );
  }

  render() {
    const { sample, match, history } = this.props;
    const sectionSampleId = match.params.sectionId;

    const sectionSample = sample.getSectionSample(sectionSampleId);
    const cloud = sectionSample.get('cloud');
    const reliability = sectionSample.get('reliability');

    return (
      <IonContent id="area-count-edit">
        <IonList lines="full">
          <IonItem routerLink={`/survey/transect/${sample.cid}/edit/sections/${sectionSampleId}/cloud`} detail>
            <IonIcon src="/images/cloud.svg" slot="start" />
            <IonLabel>{t('Cloud')}</IonLabel>
            <IonLabel slot="end">{cloud}</IonLabel>
          </IonItem>
          <IonItem routerLink={`/survey/transect/${sample.cid}/edit/sections/${sectionSampleId}/reliability`} detail>
            <IonIcon src="/images/thumb-up.svg" slot="start" />
            <IonLabel>{t('Reliability')}</IonLabel>
            <IonLabel slot="end">{reliability}</IonLabel>
          </IonItem>

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
            <IonLabel>{t('Add')}</IonLabel>
          </IonButton>
        </IonList>

        {this.getSpeciesList(sectionSample)}
      </IonContent>
    );
  }
}

export default AreaCount;
