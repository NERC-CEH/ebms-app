import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  // IonSegment,
  IonLabel,
  // IonSegmentButton,
  IonItemDivider,
} from '@ionic/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Survey from './components/Survey';
import './styles.scss';

function byCreateTime(occ1, occ2) {
  const date1 = new Date(occ1.metadata.created_on);
  const date2 = new Date(occ2.metadata.created_on);
  return date2.getTime() - date1.getTime();
}

@observer
class Component extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.object.isRequired,
  };

  state = {
    segment: 'surveys',
  };

  onSegmentClick = e => {
    this.setState({ segment: e.detail.value });
  };

  getSavedSamplesList() {
    const { savedSamples } = this.props;

    const savedSurveys = savedSamples.models
      .filter(sample => sample.metadata.saved)
      .sort(byCreateTime);

    if (!savedSurveys.length) {
      return (
        <IonList lines="full">
          <IonItem className="empty">
            <span>{t('No finished surveys')}</span>
          </IonItem>
        </IonList>
      );
    }

    return (
      <IonList>
        <IonItemDivider>
          <IonLabel>{t('Finished surveys')}</IonLabel>
        </IonItemDivider>
        {savedSurveys.map(sample => (
          <Survey key={sample.cid} sample={sample} />
        ))}
      </IonList>
    );
  }

  render() {
    const { segment } = this.state;
    const savedSamplesList = this.getSavedSamplesList();

    const showingSurveys = segment === 'surveys';
    // const showingReports = segment === 'reports';
    return (
      <>
        <IonContent id="user-report" class="ion-padding">
          {/* <IonSegment onIonChange={this.onSegmentClick} value={segment}>
            <IonSegmentButton value="surveys" checked={showingSurveys}>
              <IonLabel>{t('Surveys')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="reports" checked={showingReports} disabled>
              <IonLabel>{t('Reports')}</IonLabel>
            </IonSegmentButton>
          </IonSegment> */}

          {showingSurveys && savedSamplesList}
          {/* {showingReports && (
            <IonList>
              <small>TODO: add report</small>
            </IonList>
          )} */}
        </IonContent>
      </>
    );
  }
}

export default Component;
