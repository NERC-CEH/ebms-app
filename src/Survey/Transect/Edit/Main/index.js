import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonList, IonItem, IonIcon, IonLabel, IonContent } from '@ionic/react';
import { person, map, time, clipboard } from 'ionicons/icons';
import { observer } from 'mobx-react';
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
    const { sample } = this.props;

    const surveyStartTime = sample.get('surveyStartTime');
    const startTimePretty =
      surveyStartTime && dateTimeFormat.format(surveyStartTime);
    const surveyEndTime = sample.get('surveyEndTime');
    const endTimePretty = surveyEndTime && dateTimeFormat.format(surveyEndTime);
    const temperature = sample.get('temperature');
    const cloud = sample.get('cloud');
    const windDirection = sample.get('windDirection');
    const windSpeed = sample.get('windSpeed');
    const recorder = sample.get('recorder');
    const comment = sample.get('comment');

    return (
      <IonContent id="transect-edit">
        <IonList lines="full">
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/sections`}
            detail
          >
            <IonIcon icon={map} slot="start" />
            <IonLabel>{t('Sections')}</IonLabel>
            {this.getPrettySectionsLabel()}
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/surveyStartTime`}
            detail
          >
            <IonIcon icon={time} slot="start" />
            <IonLabel>{t('Start Time')}</IonLabel>
            <IonLabel slot="end">{startTimePretty}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/surveyEndTime`}
            detail
          >
            <IonIcon icon={time} slot="start" />
            <IonLabel>{t('End Time')}</IonLabel>
            <IonLabel slot="end">{endTimePretty}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/temperature`}
            detail
          >
            <IonIcon src="/images/thermometer.svg" slot="start" />
            <IonLabel>{t('Temperature')}</IonLabel>
            <IonLabel slot="end">{t(temperature)}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/cloud`}
            detail
          >
            <IonIcon src="/images/cloud.svg" slot="start" />
            <IonLabel>{t('Cloud')}</IonLabel>
            <IonLabel slot="end">{cloud}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/windDirection`}
            detail
          >
            <IonIcon src="/images/wind.svg" slot="start" />
            <IonLabel>{t('Wind Direction')}</IonLabel>
            <IonLabel slot="end">{t(windDirection)}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/windSpeed`}
            detail
          >
            <IonIcon src="/images/wind.svg" slot="start" />
            <IonLabel>{t('Wind Speed')}</IonLabel>
            <IonLabel slot="end">{t(windSpeed)}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/recorder`}
            detail
          >
            <IonIcon icon={person} slot="start" />
            <IonLabel>{t('Recorder')}</IonLabel>
            <IonLabel slot="end">{recorder}</IonLabel>
          </IonItem>
          <IonItem
            routerLink={`/survey/transect/${sample.cid}/edit/comment`}
            detail
          >
            <IonIcon icon={clipboard} slot="start" />
            <IonLabel>{t('Comment')}</IonLabel>
            <IonLabel slot="end">{comment}</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    );
  }
}

export default Edit;
