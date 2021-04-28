import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { toJS } from 'mobx';
import { Page, alert, toast, showInvalidsMessage } from '@apps';
import i18n from 'i18next';
import { NavContext } from '@ionic/react';
import Occurrence from 'occurrence';
import Sample from 'sample';
import Header from './Header';
import Main from './Main';

const { success, warn } = toast;

function showDeleteSpeciesPrompt(taxon) {
  const prompt = resolve => {
    const name = taxon.scientific_name;
    alert({
      header: t('Delete'),
      message: i18n.t('Are you sure you want to delete {{taxon}} ?', {
        name,
      }),
      buttons: [
        {
          text: t('Cancel'),
          role: 'cancel',
          cssClass: 'primary',
        },
        {
          text: t('Delete'),
          cssClass: 'secondary',
          handler: resolve,
        },
      ],
    });
  };

  return new Promise(prompt);
}

function setSurveyEndTime(sample) {
  sample.attrs.surveyEndime = new Date(); // eslint-disable-line no-param-reassign
  return sample.save();
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

function byCreateTime(model1, model2) {
  const date1 = new Date(model1.metadata.created_on);
  const date2 = new Date(model2.metadata.created_on);
  return date2.getTime() - date1.getTime();
}

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
  };

  static contextType = NavContext;

  _processSubmission = () => {
    const { sample } = this.props;

    const invalids = sample.validateRemote();
    if (invalids) {
      showInvalidsMessage(invalids);
      return;
    }

    sample.toggleGPStracking(false);
    const stopGPS = smp => smp.toggleGPStracking(false);
    sample.samples.forEach(stopGPS);

    sample.saveRemote();

    this.context.navigate(`/home/user-surveys`, 'root');
  };

  _processDraft = async () => {
    const { appModel, sample } = this.props;

    appModel.attrs['draftId:precise-area'] = null;
    await appModel.save();

    const saveAndReturn = () => {
      setSurveyEndTime(sample);
      sample.toggleGPStracking(false);
      sample.stopVibrateCounter();

      sample.save();
      this.context.navigate(`/home/user-surveys`, 'root');
    };

    const invalids = sample.validateRemote();
    if (invalids) {
      showInvalidsMessage(invalids, saveAndReturn);
      return;
    }

    sample.metadata.saved = true;
    saveAndReturn();
  };

  onSubmit = async () => {
    const { sample } = this.props;

    if (!sample.metadata.saved) {
      await this._processDraft();
      return;
    }

    await this._processSubmission();
  };

  navigateToSpeciesOccurrences = taxon => {
    const { match } = this.props;
    this.context.navigate(
      `${match.url}/speciesOccurrences/${taxon.warehouse_id}`
    );
  };

  toggleSpeciesSort = () => {
    const { appModel } = this.props;
    const { areaSurveyListSortedByTime } = appModel.attrs;
    appModel.attrs.areaSurveyListSortedByTime = !areaSurveyListSortedByTime;
    appModel.save();
  };

  getPreviousSurvey = () => {
    const { sample, savedSamples } = this.props;
    const sortedSavedSamples = [...savedSamples].sort(byCreateTime).reverse();
    const matchingSampleId = s => s.cid === sample.cid;

    const currentSampleIndex = sortedSavedSamples.findIndex(matchingSampleId);

    const isFirstSurvey = !currentSampleIndex;

    if (isFirstSurvey) {
      return null;
    }

    const previousSurveys = sortedSavedSamples
      .slice(0, currentSampleIndex)
      .reverse();

    const matchingSurvey = s => s.getSurvey().name === 'precise-area';
    const previousSurvey = previousSurveys.find(matchingSurvey);

    return previousSurvey;
  };

  copyPreviousSurveyTaxonList = () => {
    const { sample } = this.props;

    const previousSurvey = this.getPreviousSurvey();
    if (!previousSurvey) {
      warn(t('Sorry, no previous survey to copy species from.'));
      return;
    }

    const getSpeciesId = s => s.occurrences[0].attrs.taxon.preferredId;
    const existingSpeciesIds = sample.samples.map(getSpeciesId);

    const uniqueSpeciesList = [];
    const getNewSpeciesOnly = ({ preferredId }) => {
      if (uniqueSpeciesList.includes(preferredId)) {
        return false;
      }
      uniqueSpeciesList.push(preferredId);
      return !existingSpeciesIds.includes(preferredId);
    };

    const getTaxon = s => toJS(s.occurrences[0].attrs.taxon);
    const newSpeciesList = previousSurvey.samples
      .map(getTaxon)
      .filter(getNewSpeciesOnly);

    // copy but retain old observable ref
    sample.shallowSpeciesList.splice(
      0,
      sample.shallowSpeciesList.length,
      ...newSpeciesList
    );

    if (!newSpeciesList.length) {
      warn(t('Sorry, no species were found to copy.'));
    } else {
      success(
        i18n.t('You have succcesfully copied {{speciesCount}} species.', {
          speciesCount: newSpeciesList.length,
        })
      );
    }
  };

  deleteFromShallowList(taxon) {
    const { sample } = this.props;

    const withSamePreferredId = t => t.preferredId === taxon.preferredId;
    const taxonIndexInShallowList = sample.shallowSpeciesList.findIndex(
      withSamePreferredId
    );

    sample.shallowSpeciesList.splice(taxonIndexInShallowList, 1);
  }

  deleteSpecies = (taxon, isShallow) => {
    const { sample } = this.props;

    if (isShallow) {
      this.deleteFromShallowList(taxon);
      return;
    }

    const deleteSpecies = () => {
      const matchingTaxon = smp =>
        smp.occurrences[0].attrs.taxon.warehouse_id === taxon.warehouse_id;
      const subSamplesMatchingTaxon = sample.samples.filter(matchingTaxon);

      const destroy = s => s.destroy();
      subSamplesMatchingTaxon.forEach(destroy);
    };

    showDeleteSpeciesPrompt(taxon).then(deleteSpecies);
  };

  increaseCount = (taxon, isShallow) => {
    const { sample } = this.props;

    if (sample.isDisabled()) {
      return;
    }

    if (isShallow) {
      this.deleteFromShallowList(taxon);
    }

    const survey = sample.getSurvey();
    const newSubSample = survey.smp.create(Sample, Occurrence, taxon);
    sample.samples.push(newSubSample);
    sample.save();
  };

  render() {
    const { sample, appModel } = this.props;

    const { areaSurveyListSortedByTime } = appModel.attrs;
    const isTraining = sample.metadata.training;
    const isEditing = sample.metadata.saved;
    const isDisabled = !!sample.metadata.synced_on;

    const previousSurvey = this.getPreviousSurvey();

    return (
      <Page id="precise-area-count-edit">
        <Header
          survey={sample.getSurvey()}
          onSubmit={this.onSubmit}
          isTraining={isTraining}
          isEditing={isEditing}
          isDisabled={isDisabled}
        />
        <Main
          sample={sample}
          appModel={appModel}
          previousSurvey={previousSurvey}
          deleteSpecies={this.deleteSpecies}
          increaseCount={this.increaseCount}
          toggleTimer={toggleTimer}
          navigateToSpeciesOccurrences={this.navigateToSpeciesOccurrences}
          areaSurveyListSortedByTime={areaSurveyListSortedByTime}
          onToggleSpeciesSort={this.toggleSpeciesSort}
          isDisabled={isDisabled}
          copyPreviousSurveyTaxonList={this.copyPreviousSurveyTaxonList}
        />
      </Page>
    );
  }
}

export default withRouter(Container);
