import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonContent,
  IonButton,
} from '@ionic/react';
import { person, map, time, clipboard, open } from 'ionicons/icons';
import { observer } from 'mobx-react';
import config from 'config';
import MenuAttrItem from 'Components/MenuAttrItem';
import 'common/images/cloud.svg';
import './wind.svg';
import './thermometer.svg';

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
    const transect = sample.get('location');
    if (!transect) {
      return (
        <IonLabel slot="end" color="danger  ">
          {t('No transect')}
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
    } = sample.attributes;

    const startTimePretty =
      surveyStartTime && dateTimeFormat.format(new Date(surveyStartTime));
    const endTimePretty =
      surveyEndTime && dateTimeFormat.format(new Date(surveyEndTime));

    const baseURL = `/survey/transect/${sample.cid}/edit`;

    return (
      <IonContent id="transect-edit">
        {isDisabled && (
          <div className="info-message">
            <p>
              {t(
                'This record has been submitted and cannot be edited within this App.'
              )}
            </p>

            <IonButton href={`${config.site_url}`}>
              <IonIcon icon={open} slot="end" />
              <IonLabel>{t('eBMS website')}</IonLabel>
            </IonButton>
          </div>
        )}

        <IonList lines="full">
          <IonItem routerLink={`${baseURL}/sections`} detail>
            <IonIcon icon={map} slot="start" mode="md" />
            <IonLabel>{t('Sections')}</IonLabel>
            {this.getPrettySectionsLabel()}
          </IonItem>

          <MenuAttrItem
            routerLink={`${baseURL}/surveyStartTime`}
            disabled={isDisabled}
            icon={time}
            iconMode="md"
            label="Start Time"
            value={startTimePretty}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/surveyEndTime`}
            disabled={isDisabled}
            icon={time}
            iconMode="md"
            label="End Time"
            value={endTimePretty}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/temperature`}
            disabled={isDisabled}
            icon="/images/thermometer.svg"
            label="Temperature"
            value={t(temperature)}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon="/images/cloud.svg"
            label="Cloud"
            value={cloud}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/windDirection`}
            disabled={isDisabled}
            icon="/images/wind.svg"
            label="Cloud"
            value={t(windDirection)}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/windSpeed`}
            disabled={isDisabled}
            icon="/images/wind.svg"
            label="Wind Speed"
            value={t(windSpeed)}
          />
          <MenuAttrItem
            routerLink={`${baseURL}/recorder`}
            disabled={isDisabled}
            icon={person}
            label="Recorder"
            value={recorder}
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

export default Edit;
