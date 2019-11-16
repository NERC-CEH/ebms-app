import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonIcon,
  IonList,
  IonItem,
  IonButton,
  IonLabel,
  IonContent,
} from '@ionic/react';
import {
  removeCircleOutline,
  addCircleOutline,
  clipboard,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import 'common/images/number.svg';
import 'common/images/butterfly.svg';
import './caterpillar.svg';
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
    const stage = occurrence.get('stage');
    const comment = occurrence.get('comment');
    const count = occurrence.get('count');

    return (
      <IonContent id="area-count-occurrence-edit">
        <IonList lines="full">
          <IonItem
            routerLink={`/survey/area/${sample.cid}/edit/occ/${occurrence.cid}/taxa`}
            detail
          >
            <IonIcon src="/images/butterfly.svg" slot="start" />
            <IonLabel>{t('Species')}</IonLabel>
            <IonLabel slot="end">{species}</IonLabel>
          </IonItem>
          <IonItem id="area-count-occurrence-edit-count">
            <IonLabel>{t('Count')}</IonLabel>
            <IonIcon src="/images/number.svg" slot="start" />
            <div slot="end">
              <IonButton
                shape="round"
                fill="clear"
                size="default"
                onClick={this.decreaseCount}
              >
                <IonIcon icon={removeCircleOutline} />
              </IonButton>
              <span>{count}</span>
              <IonButton
                shape="round"
                fill="clear"
                size="default"
                onClick={this.increaseCount}
              >
                <IonIcon icon={addCircleOutline} />
              </IonButton>
            </div>
          </IonItem>
          <IonItem
            routerLink={`/survey/area/${sample.cid}/edit/occ/${occurrence.cid}/stage`}
            detail
          >
            <IonIcon src="/images/caterpillar.svg" slot="start" />
            <IonLabel>{t('Stage')}</IonLabel>
            <IonLabel slot="end">{t(stage)}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/area/${sample.cid}/edit/occ/${occurrence.cid}/comment`}
            detail
          >
            <IonIcon icon={clipboard} slot="start" mode="md" />
            <IonLabel>{t('Comment')}</IonLabel>
            <IonLabel slot="end">{comment}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    );
  }
}
export default EditOccurrence;
