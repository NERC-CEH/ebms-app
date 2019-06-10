import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonInput,
  IonIcon,
  IonContent,
  IonLabel,
} from '@ionic/react';
import AppHeader from 'common/Components/Header';
import Toggle from 'common/Components/Toggle';
import { observer } from 'mobx-react';

const datePrintOptions = [
  [],
  {
    hour: '2-digit',
    minute: '2-digit',
  },
];

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

    const customSurveyStartTime = new Date(sample.get('customSurveyStartTime') || undefined);
    let formattedStartTime;
    if (!Number.isNaN(customSurveyStartTime.getTime())) {
      formattedStartTime = customSurveyStartTime.toLocaleTimeString(
        ...datePrintOptions
      );
    }

    const customSurveyEndTime = new Date(sample.get('customSurveyEndTime') || undefined);
    let formattedEndTime;
    if (!Number.isNaN(customSurveyEndTime.getTime())) {
      formattedEndTime = customSurveyEndTime.toLocaleTimeString(
        ...datePrintOptions
      );
    }
    this.state = {
      customSurveyStartTime: formattedStartTime,
      customSurveyEndTime: formattedEndTime,
    };
  }

  onChangeSurveyTime = (key, e) => {
    const time = e.target.value;
    const timeSplit = time.split(':');
    this.setState({
      [key]: time,
    });

    const date = new Date();
    date.setHours(timeSplit[0]);
    date.setMinutes(timeSplit[1]);
    
    this.sample.set(key, date.toString());
    this.sample.save();
  };

  onToggle = (key, checked) => {
    const date = new Date();
    const time = !checked ? date.toLocaleTimeString(...datePrintOptions) : null;
    this.setState({ [key]: time });
    if (checked) {
      this.sample.set(key, null);
      this.sample.save();
      return;
    }
    this.sample.set(key, date.toString());
    this.sample.save();
  };

  render() {
    const createdOn = new Date(this.sample.metadata.created_on);
    const surveyStartTime = createdOn.toLocaleTimeString(...datePrintOptions);
    
    const { customSurveyStartTime, customSurveyEndTime } = this.state;
    return (
      <>
        <AppHeader title={t('Time')} />
        <IonContent>
          <IonList lines="full">
            <IonItem>
              <IonIcon name="time" size="small" slot="start" />
              <IonLabel text-wrap>
                {`${t('Use survey create time')}`} 
                {' '}
                <b>{surveyStartTime}</b>
              </IonLabel>
              <Toggle
                onToggle={checked =>
                  this.onToggle('customSurveyStartTime', checked)
                }
                checked={!customSurveyStartTime}
              />
            </IonItem>
            {customSurveyStartTime && (
              <IonItem>
                <IonIcon name="create" faint size="small" slot="start" />
                <IonInput
                  type="time"
                  placeholder="HH:mm"
                  onIonChange={e =>
                    this.onChangeSurveyTime('customSurveyStartTime', e)
                  }
                  value={customSurveyStartTime}
                />
              </IonItem>
            )}
            <IonItem>
              <IonIcon name="time" size="small" slot="start" />
              <IonLabel text-wrap>{`${t('Use survey finish time')}`}</IonLabel>
              <Toggle
                onToggle={checked =>
                  this.onToggle('customSurveyEndTime', checked)
                }
                checked={!customSurveyEndTime}
              />
            </IonItem>
            {customSurveyEndTime && (
              <IonItem>
                <IonIcon name="create" faint size="small" slot="start" />
                <IonInput
                  type="time"
                  placeholder="HH:mm"
                  onIonChange={e =>
                    this.onChangeSurveyTime('customSurveyEndTime', e)
                  }
                  value={customSurveyEndTime}
                />
              </IonItem>
            )}
          </IonList>
        </IonContent>
      </>
    );
  }
}

export default AreaAttr;
