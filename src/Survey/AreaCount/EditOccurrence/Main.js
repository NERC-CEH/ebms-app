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
import MenuAttrItem from 'Components/MenuAttrItem';
import 'common/images/number.svg';
import 'common/images/butterfly.svg';
import './caterpillar.svg';
import './styles.scss';

@observer
class EditOccurrence extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    occurrence: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool,
  };

  increaseCount = () => {
    const { occurrence } = this.props;

    const { count } = occurrence.attrs;
    this.props.occurrence.attrs.count = count + 1;
  };

  decreaseCount = () => {
    const { occurrence } = this.props;

    const { count } = occurrence.attrs;
    if (count <= 1) {
      return;
    }

    this.props.occurrence.attrs.count = count - 1;
  };

  render() {
    const { sample, occurrence, isDisabled } = this.props;
    const species = occurrence.attrs.taxon.scientific_name;
    const { stage } = occurrence.attrs;
    const { comment } = occurrence.attrs;
    const { count } = occurrence.attrs;
    const baseURL = `/survey/area/${sample.cid}/edit/occ/${occurrence.cid}`;

    return (
      <IonContent id="area-count-occurrence-edit">
        <IonList lines="full">
          <MenuAttrItem
            routerLink={`${baseURL}/taxa`}
            disabled={isDisabled}
            icon="/images/butterfly.svg"
            label="Species"
            value={species}
          />
          <IonItem id="area-count-occurrence-edit-count" disabled={isDisabled}>
            <IonLabel>{t('Count')}</IonLabel>
            <IonIcon src="/images/number.svg" slot="start" />
            <div slot="end">
              {!isDisabled && (
                <IonButton
                  shape="round"
                  fill="clear"
                  size="default"
                  onClick={this.decreaseCount}
                >
                  <IonIcon icon={removeCircleOutline} />
                </IonButton>
              )}

              <span>{count}</span>
              {!isDisabled && (
                <IonButton
                  shape="round"
                  fill="clear"
                  size="default"
                  onClick={this.increaseCount}
                >
                  <IonIcon icon={addCircleOutline} />
                </IonButton>
              )}
            </div>
          </IonItem>
          <MenuAttrItem
            routerLink={`${baseURL}/stage`}
            disabled={isDisabled}
            icon="/images/caterpillar.svg"
            label="Stage"
            value={t(stage)}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboard}
            iconMode="md"
            label="Comment"
            value={comment}
          />
        </IonList>
      </IonContent>
    );
  }
}

export default EditOccurrence;
