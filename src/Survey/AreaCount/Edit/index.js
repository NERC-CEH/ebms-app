import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonButton,
  IonLabel,
  IonContent,
} from '@ionic/react';
import AppHeader from 'common/Components/Header';
import Sample from 'sample';
import { observer } from 'mobx-react';
import Log from 'helpers/log';
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

@observer
class AreaCount extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
  };

  async componentDidMount() {
    const { savedSamples, match, history } = this.props;
    const sampleID = match.params.id;
    if (sampleID === 'new') {
      const sample = await createNewSample(savedSamples);
      history.replace(`/survey/${sample.cid}/edit`);
    }
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
    const area = sample.get('area');
    const time = sample.get('time');

    const occurrences = sample.occurrences.models;

    return (
      <>
        <AppHeader title={t('Area Count')} />
        <IonContent id="area-count-edit">
          <IonList lines="full">
            <IonItem href={`#survey/${sampleID}/edit/area`}>
              <IonLabel>{t('Area')}</IonLabel>
              <IonLabel slot="end">{area}</IonLabel>
            </IonItem>
            <IonItem href={`#survey/${sampleID}/edit/time`}>
              <IonLabel>{t('Time (duration)')}</IonLabel>
              <IonLabel slot="end">{time}</IonLabel>
            </IonItem>

            <IonButton
              expand="full"
              color="primary"
              href={`#survey/${sampleID}/edit/taxa`}
            >
              <IonLabel>{t('Add')}</IonLabel>
            </IonButton>
          </IonList>
          <IonList id="list">
            {occurrences.map(occ => (
              <IonItem
                key={occ.cid}
                href={`#survey/${sampleID}/edit/occ/${occ.cid}`}
              >
                <IonLabel>{occ.get('taxon').scientific_name}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </>
    );
  }
}

export default AreaCount;
