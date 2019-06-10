import React from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonSegment,
  IonLabel,
  IonSegmentButton,
} from '@ionic/react';
import PropTypes from 'prop-types';
import './styles.scss';

class Component extends React.Component {
  propTypes = {
    savedSamples: PropTypes.object.isRequired,
  };

  state = {
    segment: 'surveys',
  };

  onSegmentClick = e => {
    this.setState({ segment: e.detail.value });
  };

  render() {
    const { savedSamples } = this.props;
    const { segment } = this.state;

    let savedSamplesList;
    if (savedSamples.models.length) {
      savedSamplesList = savedSamples.models
        .filter(sample => sample.metadata.saved)
        .map(sample => {
          const date = new Date(sample.metadata.created_on);
          const prettyDate = date.toLocaleDateString();
          const speciesCount = sample.occurrences.models.length;
          return (
            <IonItem key={sample.cid}>
              <b> 
                {' '}
                {prettyDate}
              </b>
              <IonLabel slot="end">
                {speciesCount}
                {' '}
species
              </IonLabel>
            </IonItem>
          );
        });
    } else {
      savedSamplesList = <span className="empty">No finished surveys</span>;
    }
    return (
      <>
        <IonContent id="user-report" class="ion-padding">
          <IonSegment onIonChange={this.onSegmentClick}>
            <IonSegmentButton value="surveys" checked={segment === 'surveys'}>
              <IonLabel>Surveys</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="reports" checked={segment === 'reports'}>
              <IonLabel>Reports</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          
          {segment === 'surveys' && <IonList>{savedSamplesList}</IonList>}
          {segment === 'reports' && (
            <IonList>
              <small>TODO: add report</small>
            </IonList>
          )}
        </IonContent>
      </>
    );
  }
}

export default Component;
