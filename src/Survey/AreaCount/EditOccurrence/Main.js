import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonIcon,
  IonItem,
  IonButton,
  IonLabel,
  IonContent,
} from '@ionic/react';
import { observer } from 'mobx-react';
import './styles.scss';

@observer
class EditOccurrence extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    occurrence: PropTypes.object.isRequired,
  };

  increaseCount = () => {
    const count = this.props.occurrence.get('count');
    this.props.occurrence.set('count', count + 1);
  };

  decreaseCount = () => {
    const count = this.props.occurrence.get('count');
    if (count <= 1) {
      return;
    }
    this.props.occurrence.set('count', count - 1);
  };

  render() {
    const { sample, occurrence } = this.props;
    const species = occurrence.get('taxon').scientific_name;
    const comment = occurrence.get('comment');
    const count = occurrence.get('count');

    return (
      <IonContent id="area-count-occurrence-edit">
        <IonItem href={`#survey/${sample.cid}/edit/occ/${occurrence.cid}/taxa`}>
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
          href={`#survey/${sample.cid}/edit/occ/${occurrence.cid}/comment`}
        >
          <IonLabel>{t('Comment')}</IonLabel>
          <IonLabel slot="end">{comment}</IonLabel>
        </IonItem>
      </IonContent>
    );
  }
}
export default EditOccurrence;
