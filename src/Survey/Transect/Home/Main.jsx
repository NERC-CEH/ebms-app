import { Component } from 'react';
import { observer } from 'mobx-react';
import {
  personOutline,
  mapOutline,
  timeOutline,
  clipboardOutline,
  openOutline,
  thermometerOutline,
  cloudyOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import PropTypes from 'prop-types';
import { Trans as T } from 'react-i18next';
import { Main, MenuAttrItem, InfoMessage } from '@flumens';
import {
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonItemDivider,
} from '@ionic/react';
import config from 'common/config';
import windIcon from 'common/images/wind.svg';
import './styles.scss';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  minute: 'numeric',
});

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

    function checkDateisValid(str) {
      const date = new Date(str);
      // eslint-disable-next-line no-restricted-globals
      return date instanceof Date && !isNaN(date);
    }
    const startTimePretty = checkDateisValid(surveyStartTime)
      ? dateTimeFormat.format(new Date(surveyStartTime))
      : surveyStartTime;

    const endTimePretty = checkDateisValid(surveyEndTime)
      ? dateTimeFormat.format(new Date(surveyEndTime))
      : surveyEndTime;

    const baseURL = `/survey/transect/${sample.cid}`;

    const { webForm } = sample.getSurvey();

    return (
      <Main id="transect-edit">
        {isDisabled && (
          <InfoMessage
            color="tertiary"
            icon={informationCircleOutline}
            skipTranslation
          >
            <T>
              This record has been submitted and cannot be edited within this
              App.
            </T>
            <IonButton
              href={`${config.backend.url}/${webForm}?sample_id=${sample.id}`}
              expand="block"
              color="dark"
              fill="outline"
              size="small"
              className="website-link"
            >
              <IonIcon icon={openOutline} slot="end" />
              <IonLabel>
                <T>eBMS website</T>
              </IonLabel>
            </IonButton>
          </InfoMessage>
        )}

        <IonList lines="full">
          <div className="rounded">
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
              label="Start Time"
              value={startTimePretty}
              skipValueTranslation
            />

            <MenuAttrItem
              routerLink={`${baseURL}/surveyEndTime`}
              disabled={isDisabled}
              icon={timeOutline}
              label="End Time"
              value={endTimePretty}
              skipValueTranslation
            />
          </div>

          <IonItemDivider>
            <T>Weather</T>
          </IonItemDivider>
          <div className="rounded">
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
              icon={windIcon}
              label="Wind Direction"
              value={windDirection}
            />

            <MenuAttrItem
              routerLink={`${baseURL}/windSpeed`}
              disabled={isDisabled}
              icon={windIcon}
              label="Wind Speed"
              value={windSpeed}
            />
          </div>

          <IonItemDivider>
            <T>Other</T>
          </IonItemDivider>
          <div className="rounded">
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
              label="Comment"
              value={comment}
              skipValueTranslation
            />
          </div>
        </IonList>
      </Main>
    );
  }
}

export default observer(Edit);
