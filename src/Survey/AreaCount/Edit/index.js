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
import AppHeader from 'common/Components/Header';
import Sample from 'sample';
import { observer } from 'mobx-react';
import Log from 'helpers/log';
import alert from 'common/helpers/alert';
import './styles.scss';

async function createNewSample(savedSamples) {
  // general survey
  const sample = new Sample();

  // sample.startGPS();

  await sample.save();
  // add to main collection
  savedSamples.add(sample);
  return sample;
}

const timeDiffInMinutes = (startDate, endDate) =>
  Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60);

function increaseCount(occ) {
  const count = occ.get('count');
  occ.set('count', count + 1);
  occ.save();
}

function deleteOccurrence(occ) {
  const taxon = occ.get('taxon').scientific_name;
  alert({
    header: t('Delete'),
    message: `${t('Are you sure you want to delete')} ${taxon}?`,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Delete'),
        cssClass: 'secondary',
        handler: () => {
          occ.destroy();
        },
      },
    ],
  });
}

async function showDraftAlert() {
  return new Promise(resolve => {
    alert({
      header: t('Draft'),
      message: `${t(
        'Previous survey draft exists, would you like to continue it?'
      )}`,
      buttons: [
        {
          text: t('Discard'),
          handler: () => {
            resolve(false);
          },
        },
        {
          text: t('Continue'),
          cssClass: 'primary',
          handler: () => {
            resolve(true);
          },
        },
      ],
    });
  });
}

const speciesNameSort = (occ1, occ2) => {
  const taxon1 = occ1.get('taxon').scientific_name;
  const taxon2 = occ2.get('taxon').scientific_name;
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
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
  };

  async componentDidMount() {
    const { savedSamples, match, history, appModel } = this.props;
    const sampleID = match.params.id;

    if (sampleID === 'new') {
      const draftID = appModel.get('areaCountDraftId');
      let continueDraftSurvey = false;
      if (draftID) {
        continueDraftSurvey = await showDraftAlert();
      }
      if (continueDraftSurvey) {
        this.sample = savedSamples.get(draftID);
      } else {
        this.sample = await createNewSample(savedSamples);
        appModel.set('areaCountDraftId', this.sample.cid);
        await appModel.save();
      }
      history.replace(`/survey/${this.sample.cid}/edit`);
      return;
    }

    this.sample = savedSamples.get(sampleID);
  }

  navigateToOccurrence(occ) {
    const { match, history } = this.props;
    const sampleID = match.params.id;

    history.push(`/survey/${sampleID}/edit/occ/${occ.cid}`);
  }

  onSubmit = async () => {
    const { appModel, history } = this.props;

    this.sample.metadata.saved = true;
    await this.sample.save();
    appModel.set('areaCountDraftId', null);
    await appModel.save();

    history.replace(`/home/user-report`);

    // TODO:
    // sample.save(null, { remote: true })
  };

  toggleSpeciesSort = () => {
    const { appModel } = this.props;
    const areaSurveyListSortedByTime = appModel.get(
      'areaSurveyListSortedByTime'
    );
    appModel.set('areaSurveyListSortedByTime', !areaSurveyListSortedByTime);
    appModel.save();
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
    const { appModel } = this.props;
    const areaSurveyListSortedByTime = appModel.get(
      'areaSurveyListSortedByTime'
    );

    const sort = areaSurveyListSortedByTime
      ? speciesOccAddedTimeSort
      : speciesNameSort;

    const occurrences = [...sample.occurrences.models].sort(sort);

    return (
      <>
        <div id="species-list-sort">
          <IonButton fill="clear" size="small" onClick={this.toggleSpeciesSort}>
            <IonIcon name="md-funnel" />
          </IonButton>
        </div>

        <IonList id="list" lines="full">
          {occurrences.map(occ => (
            <IonItemSliding key={occ.cid}>
              <IonItem detail>
                <IonButton
                  class="area-count-edit-count"
                  onClick={() => increaseCount(occ)}
                  fill="clear"
                >
                  {occ.get('count')}
                </IonButton>
                <IonLabel onClick={() => this.navigateToOccurrence(occ)}>
                  {occ.get('taxon').scientific_name}
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
      </>
    );
  }

  render() {
    const { match, savedSamples } = this.props;
    const sampleID = match.params.id;
    const sample = savedSamples.get(sampleID);

    if (sampleID === 'new') {
      return null;
    }

    // Not found
    if (!sample) {
      Log('No sample model found.', 'e');
      // radio.trigger('app:404:show', { replace: true });
      return null;
    }

    // TODO: check if submitted
    const { area } = sample.get('location');
    const areaPretty = area && `${area.toLocaleString()} m²`;
    let startTime = new Date(sample.metadata.created_on);
    const customSurveyStartTime = sample.get('customSurveyStartTime');
    if (customSurveyStartTime) {
      startTime = new Date(customSurveyStartTime);
    }

    let endTime = new Date();
    const customSurveyEndTime = sample.get('customSurveyEndTime');
    if (customSurveyEndTime) {
      endTime = new Date(customSurveyEndTime);
    }

    const time = timeDiffInMinutes(startTime, endTime);

    const finishButton = (
      <IonButton onClick={this.onSubmit}>{t('Finish')}</IonButton>
    );

    return (
      <>
        <AppHeader title={t('Area Count')} rightSlot={finishButton} />
        <IonContent id="area-count-edit">
          <IonList lines="full">
            <IonItem href={`#survey/${sampleID}/edit/area`} detail>
              <IonLabel>{t('Area')}</IonLabel>
              <IonLabel slot="end">{areaPretty}</IonLabel>
            </IonItem>
            <IonItem href={`#survey/${sampleID}/edit/time`} detail>
              <IonLabel>{t('Time (duration)')}</IonLabel>
              <IonLabel slot="end">{`${time} ${t('minutes')}`}</IonLabel>
            </IonItem>

            <IonButton
              color="primary"
              id="add"
              href={`#survey/${sampleID}/edit/taxa`}
            >
              <IonIcon name="add-circle-outline" slot="start" />
              <IonLabel>{t('Add')}</IonLabel>
            </IonButton>
          </IonList>

          {this.getSpeciesList(sample)}
        </IonContent>
      </>
    );
  }
}

export default AreaCount;
