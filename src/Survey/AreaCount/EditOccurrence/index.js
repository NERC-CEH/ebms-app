import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonIcon,
  IonItem,
  IonButton,
  IonLabel,
  IonContent,
} from '@ionic/react';
import AppHeader from 'common/Components/Header';
import { observer } from 'mobx-react';
import './styles.scss';

@observer
class EditOccurrence extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { match, savedSamples } = props;

    const sampleID = match.params.id;
    const occID = match.params.occId;
    const sample = savedSamples.get(sampleID);
    this.sample = sample;
    this.occ = sample.occurrences.models.find(occ => occ.cid === occID);
  }

  increaseCount = () => {
    const count = this.occ.get('count');
    this.occ.set('count', count + 1);
  };

  decreaseCount = () => {
    const count = this.occ.get('count');
    if (count <= 1) {
      return;
    }
    this.occ.set('count', count - 1);
  };

  render() {
    const species = this.occ.get('taxon').scientific_name;
    const comment = this.occ.get('comment');
    const count = this.occ.get('count');

    return (
      <>
        <AppHeader title={t('Edit Occurrence')} />
        <IonContent id="area-count-occurrence-edit">
          <IonItem
            href={`#survey/${this.sample.cid}/edit/occ/${this.occ.cid}/taxa`}
          >
            <IonLabel>{t('Species')}</IonLabel>
            <IonLabel slot="end">{species}</IonLabel>
          </IonItem>
          <IonItem id="area-count-occurrence-edit-count">
            <IonLabel>{t('Count')}</IonLabel>
            <div slot="end">
              <IonButton
                shape="round"
                fill="clear"
                size="default"
                onClick={this.increaseCount}
              >
                <IonIcon name="add-circle-outline" />
              </IonButton>
              <span>{count}</span>
              <IonButton
                shape="round"
                fill="clear"
                size="default"
                onClick={this.decreaseCount}
              >
                <IonIcon name="remove-circle-outline" />
              </IonButton>
            </div>
          </IonItem>
          <IonItem
            href={`#survey/${this.sample.cid}/edit/occ/${this.occ.cid}/comment`}
          >
            <IonLabel>{t('Comment')}</IonLabel>
            <IonLabel slot="end">{comment}</IonLabel>
          </IonItem>
        </IonContent>
      </>
    );
  }
}
export default EditOccurrence;
