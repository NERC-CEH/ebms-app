import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import {
  IonIcon,
  IonList,
  IonItemDivider,
  IonItem,
  IonLabel,
} from '@ionic/react';
import {
  arrowUndoOutline,
  flameOutline,
  schoolOutline,
  flagOutline,
  globeOutline,
  shareOutline,
  paperPlaneOutline,
  addCircleOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import languages from 'common/config/languages';
import countries from 'common/config/countries';
import config from 'config';
import surveys from 'common/config/surveys';
import { Main, alert, InfoMessage, MenuAttrToggle } from '@apps';
import butterflyIcon from 'common/images/butterfly.svg';
import mothIcon from 'common/images/moth.svg';
import './styles.scss';

function resetDialog(resetApp) {
  alert({
    header: 'Reset',
    message: (
      <>
        <T>
          Are you sure you want to reset the application to its initial state?
        </T>
        <p>
          <b>
            <T>This will wipe all the locally stored app data!</T>
          </b>
        </p>
      </>
    ),
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Reset',
        cssClass: 'secondary',
        handler: resetApp,
      },
    ],
  });
}

function uploadAllSamplesDialog(uploadAllSamples) {
  alert({
    header: 'Upload All',
    message: <T>Are you sure you want to upload all finished records?</T>,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Upload',
        cssClass: 'secondary',
        handler: uploadAllSamples,
      },
    ],
  });
}

@observer
class Component extends React.Component {
  static propTypes = {
    resetApp: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    uploadAllSamples: PropTypes.func.isRequired,
    useTraining: PropTypes.bool.isRequired,
    useExperiments: PropTypes.bool.isRequired,
    sendAnalytics: PropTypes.bool.isRequired,
    primarySurvey: PropTypes.string,
    language: PropTypes.string,
    country: PropTypes.string,
    speciesGroups: PropTypes.array,
  };

  render() {
    const {
      resetApp,
      onToggle,
      useTraining,
      useExperiments,
      language,
      country,
      sendAnalytics,
      uploadAllSamples,
      primarySurvey,
      speciesGroups,
    } = this.props;

    const primarySurveyLabel = surveys[primarySurvey].label;

    const onSendAnalyticsToggle = checked => onToggle('sendAnalytics', checked);
    const onUseExperiments = checked => onToggle('useExperiments', checked);
    const onResetDialog = () => resetDialog(resetApp);
    const onTrainingToggle = checked => onToggle('useTraining', checked);
    const onSubmitAllDialog = () => uploadAllSamplesDialog(uploadAllSamples);

    return (
      <Main class="app-settings">
        <IonList lines="full">
          <IonItemDivider>
            <T>Surveying</T>
          </IonItemDivider>
          <div className="rounded">
            <IonItem id="submit-all-btn" onClick={onSubmitAllDialog}>
              <IonIcon icon={paperPlaneOutline} size="small" slot="start" />
              <IonLabel>
                <T>Upload All</T>
              </IonLabel>
            </IonItem>
            <InfoMessage color="medium">
              Batch upload all finished records. This does not include records
              in &#39;draft&#39; stage.
            </InfoMessage>
            <IonItem routerLink="/settings/primary-survey" detail>
              <IonLabel>
                <T>Primary Survey</T>
              </IonLabel>
              <IonIcon icon={addCircleOutline} size="small" slot="start" />
              <IonLabel slot="end">
                <T>{primarySurveyLabel}</T>
              </IonLabel>
            </IonItem>
            <IonItem routerLink="/settings/species" detail>
              <IonLabel>
                <T>Species groups</T>
              </IonLabel>
              <IonIcon icon={butterflyIcon} size="small" slot="start" />
              <IonLabel slot="end">{speciesGroups.length}</IonLabel>
            </IonItem>
            <IonItem routerLink="/settings/moth-survey" detail>
              <IonLabel>
                <T>Moth Survey</T>
              </IonLabel>
              <IonIcon icon={mothIcon} size="small" slot="start" />
            </IonItem>
          </div>

          <IonItemDivider>
            <T>Application</T>
          </IonItemDivider>
          <div className="rounded">
            <IonItem routerLink="/settings/language" detail>
              <IonLabel>
                <T>Language</T>
              </IonLabel>
              <IonIcon icon={flagOutline} size="small" slot="start" />
              <IonLabel slot="end">{languages[language]}</IonLabel>
            </IonItem>
            <IonItem routerLink="/settings/country" detail>
              <IonLabel>
                <T>Country</T>
              </IonLabel>
              <IonIcon icon={globeOutline} size="small" slot="start" />
              <IonLabel slot="end">
                <T>{countries[country]}</T>
              </IonLabel>
            </IonItem>

            <MenuAttrToggle
              icon={schoolOutline}
              label="Training Mode"
              value={useTraining}
              onChange={onTrainingToggle}
            />
            <InfoMessage color="medium">
              Mark any new records as &#39;training&#39; and exclude from all
              reports.
            </InfoMessage>

            <MenuAttrToggle
              icon={flameOutline}
              label="Experimental Features"
              value={useExperiments}
              onChange={onUseExperiments}
            />

            <MenuAttrToggle
              icon={shareOutline}
              label="Share App Analytics"
              value={sendAnalytics}
              onChange={onSendAnalyticsToggle}
            />
            <InfoMessage color="medium">
              Share app crash data so we can make the app more reliable.
            </InfoMessage>

            <IonItem id="app-reset-btn" onClick={onResetDialog}>
              <IonIcon icon={arrowUndoOutline} size="small" slot="start" />
              <T>Reset</T>
            </IonItem>
          </div>
        </IonList>

        <p className="app-version">{`v${config.version} (${config.build})`}</p>
      </Main>
    );
  }
}

export default Component;
