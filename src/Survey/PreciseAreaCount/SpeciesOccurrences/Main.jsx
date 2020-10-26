import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonLabel,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonItemDivider,
  IonBadge,
  IonIcon,
} from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import GridRefValue from 'Components/GridRefValue';
import { observer } from 'mobx-react';
import { Main, MenuAttrItem, InfoBackgroundMessage } from '@apps';
import { Trans as T } from 'react-i18next';
import 'common/images/number.svg';
import 'common/images/butterfly.svg';
import './styles.scss';

@observer
class EditOccurrence extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    samples: PropTypes.object.isRequired,
    navigateToOccurrence: PropTypes.func.isRequired,
    deleteSample: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
  };

  getSamplesList = () => {
    const { deleteSample, samples, navigateToOccurrence } = this.props;

    const getOccurrence = smp => {
      const occ = smp.occurrences[0];
      const prettyTime = new Date(smp.metadata.created_on)
        .toLocaleTimeString()
        .replace(/(:\d{2}| [AP]M)$/, '');

      const { stage } = occ.attrs;

      let location;
      if (smp.hasLoctionMissingAndIsnotLocating()) {
        location = <IonIcon icon={warningOutline} color="danger" />;
      } else {
        location = <GridRefValue sample={smp} />;
      }

      const navigateToOccurrenceWithSample = () => navigateToOccurrence(smp);

      const deleteSubSample = () => deleteSample(smp);

      return (
        <IonItemSliding key={smp.cid}>
          <IonItem detail onClick={navigateToOccurrenceWithSample}>
            <IonLabel>{prettyTime}</IonLabel>
            <IonLabel>
              <IonBadge color="medium">{stage}</IonBadge>
            </IonLabel>
            <IonLabel slot="end">{location}</IonLabel>
          </IonItem>
          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={deleteSubSample}>
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    };

    return samples.map(getOccurrence);
  };

  render() {
    const { samples, isDisabled, match } = this.props;

    if (!samples[0]) {
      return (
        <Main id="area-count-occurrence-edit">
          <IonList id="list" lines="full">
            <InfoBackgroundMessage>No species added</InfoBackgroundMessage>
          </IonList>
        </Main>
      );
    }

    const species = samples[0].occurrences[0].getTaxonName();

    const count = samples.length;

    return (
      <Main id="area-count-occurrence-edit">
        <IonList lines="full">
          <MenuAttrItem
            routerLink={`${match.url}/taxon`}
            disabled={isDisabled}
            icon="/images/butterfly.svg"
            label="Species"
            value={species}
          />

          <IonItemDivider>
            Occurrences list
            <span slot="end">{count}</span>
          </IonItemDivider>

          {this.getSamplesList()}
        </IonList>
      </Main>
    );
  }
}

export default EditOccurrence;
