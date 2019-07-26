import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonDatetime,
  IonIcon,
  IonContent,
  IonLabel,
} from '@ionic/react';
import { time, create } from 'ionicons/icons';
import AppHeader from 'common/Components/Header';
import Toggle from 'common/Components/Toggle';
import { observer } from 'mobx-react';

function isoDate(date) {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';

  const pad = num => {
    const norm = Math.floor(Math.abs(num));
    return (norm < 10 ? '0' : '') + norm;
  };

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}${dif}${pad(tzo / 60)}:${pad(tzo % 60)}`;
}

@observer
class AreaAttr extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { match, savedSamples } = props;

    const sampleID = match.params.id;
    const sample = savedSamples.get(sampleID);
    this.sample = sample;
  }

  onChangeSurveyTime = e => {
    const createdOn = new Date(this.sample.metadata.created_on);
    const surveyStartTime = new Date(this.sample.get('surveyStartTime'));
    const isDefaultStartTime =
      surveyStartTime.getTime() === createdOn.getTime();

    if (isDefaultStartTime) {
      return;
    }

    this.sample.save({ surveyStartTime: new Date(e.target.value) });
  };

  onToggle = useSurveyCreateTime => {
    if (useSurveyCreateTime) {
      this.sample.save({ surveyStartTime: this.sample.metadata.created_on });
      return;
    }

    this.sample.save({ surveyStartTime: new Date() });
  };

  render() {
    const createdOn = new Date(this.sample.metadata.created_on);
    const surveyStartTime = new Date(this.sample.get('surveyStartTime'));
    const isDefaultStartTime =
      surveyStartTime.getTime() === createdOn.getTime();

    return (
      <>
        <AppHeader title={t('Duration')} />
        <IonContent>
          <IonList lines="full">
            <IonItem>
              <IonIcon icon={time} size="small" slot="start" />
              <IonLabel text-wrap>{`${t('Use survey create time')} `}</IonLabel>
              <Toggle onToggle={this.onToggle} checked={isDefaultStartTime} />
            </IonItem>
            <IonItem>
              <IonIcon icon={create} faint size="small" slot="start" />
              <IonLabel>HH:mm</IonLabel>
              <IonDatetime
                displayFormat="HH:mm"
                onIonChange={this.onChangeSurveyTime}
                value={isoDate(surveyStartTime)}
                disabled={isDefaultStartTime}
                max={isoDate(new Date())}
                doneText={t('Done')}
                cancelText={t('Cancel')}
              />
            </IonItem>
          </IonList>
        </IonContent>
      </>
    );
  }
}

export default AreaAttr;
