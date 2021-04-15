import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonList, IonItem, IonButton, IonLabel } from '@ionic/react';
import {
  removeCircleOutline,
  addCircleOutline,
  clipboardOutline,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import { Main, MenuAttrItem } from '@apps';
import { Trans as T } from 'react-i18next';
import numberIcon from 'common/images/number.svg';
import butterflyIcon from 'common/images/butterfly.svg';
import caterpillarIcon from './caterpillar.svg';
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
    const foundInName = occurrence.attrs.taxon.found_in_name;
    const species = occurrence.attrs.taxon[foundInName];
    const { stage } = occurrence.attrs;
    const { comment } = occurrence.attrs;
    const { count } = occurrence.attrs;
    const baseURL = `/survey/area/${sample.cid}/edit/occ/${occurrence.cid}`;

    return (
      <Main id="area-count-occurrence-edit">
        <IonList lines="full">
          <MenuAttrItem
            routerLink={`${baseURL}/taxa`}
            disabled={isDisabled}
            icon={butterflyIcon}
            label="Species"
            value={species}
          />
          <IonItem id="area-count-occurrence-edit-count" disabled={isDisabled}>
            <IonLabel>
              <T>Count</T>
            </IonLabel>
            <IonIcon icon={numberIcon} slot="start" />
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
            icon={caterpillarIcon}
            label="Stage"
            value={stage}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="Comment"
            value={comment}
          />
        </IonList>
      </Main>
    );
  }
}

export default EditOccurrence;
