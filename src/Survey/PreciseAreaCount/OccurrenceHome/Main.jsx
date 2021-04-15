import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonList, IonIcon } from '@ionic/react';
import {
  clipboardOutline,
  locationOutline,
  warningOutline,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import { Main, MenuAttrItem } from '@apps';
import GridRefValue from 'Components/GridRefValue';
import butterflyIcon from 'common/images/butterfly.svg';
import caterpillarIcon from './caterpillar.svg';
import './styles.scss';

@observer
class EditOccurrence extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    subSample: PropTypes.object.isRequired,
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
    const { match, occurrence, subSample, isDisabled } = this.props;
    const species = occurrence.getTaxonName();
    const { stage } = occurrence.attrs;
    const { comment } = occurrence.attrs;
    const baseURL = match.url;

    const sampleBaseUrl = baseURL.split('/occ');
    sampleBaseUrl.pop();

    let location;
    if (subSample.hasLoctionMissingAndIsnotLocating()) {
      location = <IonIcon icon={warningOutline} color="danger" />;
    } else {
      location = <GridRefValue sample={subSample} />;
    }

    return (
      <Main id="area-count-occurrence-edit">
        <IonList lines="full">
          <MenuAttrItem
            routerLink={`${baseURL}/taxon`}
            disabled={isDisabled}
            icon={butterflyIcon}
            label="Species"
            value={species}
          />
          <MenuAttrItem
            routerLink={`${sampleBaseUrl}/location`}
            disabled={isDisabled}
            icon={locationOutline}
            label="Location"
            value={location}
            skipTranslation
          />
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
