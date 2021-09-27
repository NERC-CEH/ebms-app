import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonButton, NavContext } from '@ionic/react';
import i18n from 'i18next';
import { Trans as T } from 'react-i18next';
import { Page, Header, alert } from '@apps';
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
    message: i18n.t('Are you sure you want to delete {{taxon}} ?', {
      taxon,
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
    subSample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  toggleSpeciesSort = () => {
    const { appModel } = this.props;
    const { areaSurveyListSortedByTime } = appModel.attrs;
    appModel.attrs.areaSurveyListSortedByTime = !areaSurveyListSortedByTime;
    appModel.save();
  };

  getNextSectionButton = () => {
    const { sample, subSample } = this.props;

    const byCid = ({ cid }) => cid === subSample.cid;
    const currentSectionIndex = sample.samples.findIndex(byCid);

    const nextSectionIndex = currentSectionIndex + 1;
    const nextSectionSample = sample.samples[nextSectionIndex];
    const isLastSection = !nextSectionSample;
    if (isLastSection) {
      return null;
    }

    const nextSectionSampleId = nextSectionSample.cid;

    const navigateToSection = e => {
      e.preventDefault();
      this.context.navigate(
        `/survey/transect/${sample.cid}/edit/sections/${nextSectionSampleId}`,
        'none',
        'replace'
      );
    };

    return (
      <IonButton onClick={navigateToSection}>
        <T>Next</T>
      </IonButton>
    );
  };

  render() {
    const { sample, subSample, appModel } = this.props;

    const { areaSurveyListSortedByTime } = appModel.attrs;
    const isDisabled = !!sample.metadata.synced_on;

    const sectionCode = subSample.attrs.location.code || t('Section');

    return (
      <Page id="transect-sections-edit">
        <Header
          title={sectionCode}
          defaultHref="/home/user-surveys"
          rightSlot={this.getNextSectionButton()}
        />
        <Main
          sample={sample}
          subSample={subSample}
          deleteOccurrence={deleteOccurrence}
          increaseCount={increaseCount}
          decreaseCount={decreaseCount}
          areaSurveyListSortedByTime={areaSurveyListSortedByTime}
          onToggleSpeciesSort={this.toggleSpeciesSort}
          isDisabled={isDisabled}
        />
      </Page>
    );
  }
}

export default Container;
