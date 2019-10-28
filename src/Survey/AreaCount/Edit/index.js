import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import alert from 'common/helpers/alert';
import Header from './Header';
import Main from './Main';

function showValidationAlert(errors, onSaveDraft) {
  const errorsPretty = errors.errors.reduce(
    (agg, err) => `${agg} ${t(err)}`,
    ''
  );
  alert({
    header: t('Survey incomplete'),
    message: `${errorsPretty}`,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
      },
      {
        text: t('Save Draft'),
        cssClass: 'secondary',
        handler: onSaveDraft,
      },
    ],
  });
}

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

function setSurveyEndTime(sample) {
  return sample.save({
    surveyEndime: new Date(),
  });
}

/* eslint-disable no-param-reassign */
function toggleTimer(sample) {
  if (sample.timerPausedTime.time) {
    const pausedTime =
      Date.now() - new Date(sample.timerPausedTime.time).getTime();
    sample.metadata.pausedTime += pausedTime;
    sample.timerPausedTime.time = null;
    sample.save();
    return;
  }
  sample.timerPausedTime.time = new Date();
}
/* eslint-enable no-param-reassign */

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object,
    history: PropTypes.object,
    appModel: PropTypes.object.isRequired,
  };

  _processSubmission = async () => {
    const { history } = this.props;
    const { sample } = this.state;

    const errors = await sample.validateRemote();
    if (errors) {
      showValidationAlert(errors);
      return;
    }
    sample.toggleGPStracking(false);
    sample.error.message = null;

    sample.save(null, { remote: true }).catch(e => {
      sample.error.message = e.message;
    });
    history.replace(`/home/user-surveys`);
  };

  _processDraft = async () => {
    const { history, appModel } = this.props;
    const { sample } = this.state;

    appModel.set('areaCountDraftId', null);
    await appModel.save();

    const saveAndReturn = () => {
      setSurveyEndTime(sample);
      sample.toggleGPStracking(false);
      sample.stopVibrateCounter();

      sample.save();
      history.replace(`/home/user-surveys`);
    };

    const errors = await sample.validateRemote();
    if (errors) {
      showValidationAlert(errors, saveAndReturn);
      return;
    }

    sample.metadata.saved = true;
    saveAndReturn();
  };

  onSubmit = async () => {
    const { sample } = this.state;

    if (!sample.metadata.saved) {
      await this._processDraft();
      return;
    }

    await this._processSubmission();
  };

  navigateToOccurrence = occ => {
    const { match, history } = this.props;
    const sampleID = match.params.id;

    history.push(`/survey/area/${sampleID}/edit/occ/${occ.cid}`);
  };

  toggleSpeciesSort = () => {
    const { appModel } = this.props;
    const areaSurveyListSortedByTime = appModel.get(
      'areaSurveyListSortedByTime'
    );
    appModel.set('areaSurveyListSortedByTime', !areaSurveyListSortedByTime);
    appModel.save();
  };

  render() {
    const { sample, appModel, history } = this.props;

    if (!sample) {
      return null;
    }

    const areaSurveyListSortedByTime = appModel.get(
      'areaSurveyListSortedByTime'
    );

    const isTraining = sample.metadata.training;
    const isEditing = sample.metadata.saved;
    return (
      <IonPage>
        <Header
          onSubmit={this.onSubmit}
          isTraining={isTraining}
          isEditing={isEditing}
        />
        <Main
          sample={sample}
          deleteOccurrence={deleteOccurrence}
          increaseCount={increaseCount}
          toggleTimer={toggleTimer}
          navigateToOccurrence={this.navigateToOccurrence}
          areaSurveyListSortedByTime={areaSurveyListSortedByTime}
          onToggleSpeciesSort={this.toggleSpeciesSort}
          history={history}
        />
      </IonPage>
    );
  }
}

export default Container;
