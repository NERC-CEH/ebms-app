import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonList, IonItem, IonIcon, IonLabel, IonButton } from '@ionic/react';
import { Main, MenuAttrItem } from '@apps';
import { Trans as T } from 'react-i18next';
import {
  personOutline,
  mapOutline,
  timeOutline,
  clipboardOutline,
  openOutline,
  thermometerOutline,
  cloudyOutline,
} from 'ionicons/icons';
import { observer } from 'mobx-react';
import config from 'config';
import 'common/images/wind.svg';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

@observer
class Edit extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool,
  };

  getPrettySectionsLabel = () => {
    const { sample } = this.props;
    const transect = sample.attrs.location;
    if (!transect) {
      return (
        <IonLabel slot="end" color="danger  ">
          <T>No transect</T>
        </IonLabel>
      );
    }

    return <IonLabel slot="end">{transect.name || transect.id}</IonLabel>;
  };

  render() {
    const { sample, isDisabled } = this.props;

    const {
      temperature,
      cloud,
      windDirection,
      windSpeed,
      recorder,
      comment,
      surveyStartTime,
      surveyEndTime,
    } = sample.attrs;

    const startTimePretty =
      surveyStartTime && dateTimeFormat.format(new Date(surveyStartTime));
    const endTimePretty =
      surveyEndTime && dateTimeFormat.format(new Date(surveyEndTime));

    const baseURL = `/survey/transect/${sample.cid}/edit`;

    return (
      <Main id="transect-edit">
        {isDisabled && (
          <div className="info-message">
            <p>
              <T>
                This record has been submitted and cannot be edited within this
                App.
              </T>
            </p>

            <IonButton href={`${config.site_url}`}>
              <IonIcon icon={openOutline} slot="end" />
              <IonLabel>
                <T>eBMS website</T>
              </IonLabel>
            </IonButton>
          </div>
        )}

        <IonList lines="full">
          <IonItem routerLink={`${baseURL}/sections`} detail>
            <IonIcon icon={mapOutline} slot="start" mode="md" />
            <IonLabel>
              <T>Sections</T>
            </IonLabel>
            {this.getPrettySectionsLabel()}
          </IonItem>

          <MenuAttrItem
            routerLink={`${baseURL}/surveyStartTime`}
            disabled={isDisabled}
            icon={timeOutline}
            iconMode="md"
            label="Start Time"
            value={startTimePretty}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/surveyEndTime`}
            disabled={isDisabled}
            icon={timeOutline}
            iconMode="md"
            label="End Time"
            value={endTimePretty}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/temperature`}
            disabled={isDisabled}
            icon={thermometerOutline}
            label="Temperature"
            value={temperature}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon={cloudyOutline}
            label="Cloud"
            value={cloud}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windDirection`}
            disabled={isDisabled}
            icon="/images/wind.svg"
            label="Wind Direction"
            value={windDirection}
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windSpeed`}
            disabled={isDisabled}
            icon="/images/wind.svg"
            label="Wind Speed"
            value={windSpeed}
          />

          <MenuAttrItem
            routerLink={`${baseURL}/recorder`}
            disabled={isDisabled}
            icon={personOutline}
            label="Recorder"
            value={recorder}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            iconMode="md"
            label="Comment"
            value={comment}
            skipValueTranslation
          />
        </IonList>
      </Main>
    );
  }
}

export default Edit;
