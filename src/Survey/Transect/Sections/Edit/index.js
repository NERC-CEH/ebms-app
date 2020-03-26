import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import alert from 'common/helpers/alert';
import AppHeader from 'Components/Header';
import Main from './Main';

function increaseCount(occ) {
  const { count } = occ.attrs;
  occ.attrs.count = count + 1;
  occ.save();
}

function decreaseCount(occ) {
  const { count } = occ.attrs;
  if (count <= 1) {
    return;
  }
  occ.attrs.count = count - 1;
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

  render() {
    const { sample, appModel, match, history } = this.props;

    const { areaSurveyListSortedByTime } = appModel.attrs;
    const isDisabled = !!sample.metadata.synced_on;

    return (
      <IonPage>
        <AppHeader title={t('Section')} defaultHref="/home/user-surveys" />
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
      </IonPage>
    );
  }
}

export default Container;
