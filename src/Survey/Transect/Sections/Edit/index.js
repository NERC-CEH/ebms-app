import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {  IonButton } from '@ionic/react';
import alert from 'common/helpers/alert';
import Page from 'Lib/Page';
import Header from 'Lib/Header';
import Main from './Main';

function increaseCount(occ) {
  occ.attrs.count++; // eslint-disable-line no-param-reassign
  occ.save();
}

function decreaseCount(occ) {
  const { count } = occ.attrs;
  if (count <= 1) {
    return;
  }
  
  occ.attrs.count--; // eslint-disable-line no-param-reassign
  occ.save();
}

function deleteOccurrence(occ) {
  const taxon = occ.attrs.taxon.scientific_name;
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

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object,
    history: PropTypes.object,
    appModel: PropTypes.object.isRequired,
  };

  toggleSpeciesSort = () => {
    const { appModel } = this.props;
    const { areaSurveyListSortedByTime } = appModel.attrs;
    appModel.attrs.areaSurveyListSortedByTime = !areaSurveyListSortedByTime;
    appModel.save();
  };

  getNextSectionButton = sectionSample => {
    const { sample, match, history } = this.props;

    const currentSectionIndex = sample.samples.findIndex(
      ({ cid }) => cid === sectionSample.cid
    );

    const nextSectionIndex = currentSectionIndex + 1;
    const nextSectionSample = sample.samples[nextSectionIndex];
    const isLastSection = !nextSectionSample;
    if (isLastSection) {
      return null;
    }

    const nextSectionSampleId = nextSectionSample.cid;

    return (
      <IonButton
        onClick={e => {
          e.preventDefault();
          history.push(
            `/survey/transect/${match.params.id}/edit/sections/${nextSectionSampleId}`
          );
        }}
      >
        {t('Next')}
      </IonButton>
    );
  };

  render() {
    const { sample, appModel, match, history } = this.props;

    const { areaSurveyListSortedByTime } = appModel.attrs;
    const isDisabled = !!sample.metadata.synced_on;

    const sectionSampleId = match.params.sectionId;

    const sectionSample = sample.getSectionSample(sectionSampleId);
    const sectionCode = sectionSample.attrs.location.code || t('Section');

    return (
      <Page id="transect-sections-edit">
        <Header
          title={sectionCode}
          defaultHref="/home/user-surveys"
          rightSlot={this.getNextSectionButton(sectionSample)}
        />
        <Main
          sample={sample}
          deleteOccurrence={deleteOccurrence}
          increaseCount={increaseCount}
          decreaseCount={decreaseCount}
          areaSurveyListSortedByTime={areaSurveyListSortedByTime}
          onToggleSpeciesSort={this.toggleSpeciesSort}
          match={match}
          history={history}
          isDisabled={isDisabled}
        />
      </Page>
    );
  }
}

export default Container;
