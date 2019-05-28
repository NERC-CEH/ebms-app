import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonList, IonItem, IonInput, IonIcon, IonContent } from '@ionic/react';
import AppHeader from 'common/Components/Header';
import { observer } from 'mobx-react';

@observer
class AreaAttr extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { match, savedSamples } = props;

    const sampleID = match.params.id;
    const sample = savedSamples.get(sampleID);
    this.sample = sample;

    this.state = {
      value: sample.get('area'),
    };
  }

  onChange = e => {
    const area = e.target.value;
    this.setState({
      value: area,
    });
    this.sample.set('area', area);
  };

  render() {
    return (
      <>
        <AppHeader title={t('Area')} />
        <IonContent>
          <IonList lines="full">
            <IonItem>
              <IonIcon name="" faint size="small" slot="start" />
              <IonInput
                type="text"
                placeholder="area"
                onIonChange={this.onChange}
                value={this.state.value}
              />
            </IonItem>
          </IonList>
        </IonContent>
      </>
    );
  }
}

export default AreaAttr;
