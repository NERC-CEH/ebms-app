import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import alert from 'common/helpers/alert';
import AppHeader from 'Components/Header';
import Main from './Main';

function increaseCount(occ) {
  const count = occ.get('count');
  occ.set('count', count + 1);
  occ.save();
}

function decreaseCount(occ) {
  const count = occ.get('count');
  if (count <= 1) {
    return;
  }
  occ.set('count', count - 1);
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
    const areaSurveyListSortedByTime = appModel.get(
      'areaSurveyListSortedByTime'
    );
    appModel.set('areaSurveyListSortedByTime', !areaSurveyListSortedByTime);
    appModel.save();
  };

  render() {
    const { sample, appModel, match, history } = this.props;

    const areaSurveyListSortedByTime = appModel.get(
      'areaSurveyListSortedByTime'
    );

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
        />
      </IonPage>
    );
  }
}

export default Container;
