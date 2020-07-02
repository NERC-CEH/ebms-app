import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Toggle from 'Lib/Toggle';
import {
  IonIcon,
  IonList,
  IonItemDivider,
  IonItem,
  IonLabel,
  IonNote,
} from '@ionic/react';
import { undo, school, flag, globe, share, paperPlane } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import alert from 'common/helpers/alert';
import languages from 'common/config/languages';
import countries from 'common/config/countries';
import config from 'config';
import Main from 'Lib/Main';
import './styles.scss';

function resetDialog(resetApp) {
  alert({
    header: t('Reset'),
    message: `${t(
      'Are you sure you want to reset the application to its initial state?'
    )}<p><b>${t('This will wipe all the locally stored app data!')}</b></p>`,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Reset'),
        cssClass: 'secondary',
        handler: resetApp,
      },
    ],
  });
}

function uploadAllSamplesDialog(uploadAllSamples) {
  alert({
    header: t('Upload All'),
    message: t('Are you sure you want to upload all finished records?'),
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Upload'),
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
    sendAnalytics: PropTypes.bool.isRequired,
    language: PropTypes.string,
    country: PropTypes.string,
  };

  render() {
    const {
      resetApp,
      onToggle,
      useTraining,
      language,
      country,
      sendAnalytics,
      uploadAllSamples,
    } = this.props;

    return (
      <Main class="app-settings">
        <IonList lines="full">
          <IonItemDivider>
            <T>Records</T>
          </IonItemDivider>
          <IonItem
            id="submit-all-btn"
            onClick={() => uploadAllSamplesDialog(uploadAllSamples)}
          >
            <IonIcon icon={paperPlane} size="small" slot="start" />
            <IonLabel>
              <T>Upload All</T>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                <T>
                  Batch upload all finished records. This does not include
                  records in &#39;draft&#39; stage.
                </T>
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItemDivider>
            <T>Application</T>
          </IonItemDivider>
          <IonItem routerLink="/settings/language">
            <IonLabel>
              <T>Language</T>
            </IonLabel>
            <IonIcon icon={flag} size="small" slot="start" />
            <IonLabel slot="end">{languages[language]}</IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/country">
            <IonLabel>
              <T>Country</T>
            </IonLabel>
            <IonIcon icon={globe} size="small" slot="start" />
            <IonLabel slot="end">
              <T>{countries[country]}</T>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={school} size="small" slot="start" />
            <IonLabel>
              <T>Training Mode</T>
            </IonLabel>
            <Toggle
              onToggle={checked => onToggle('useTraining', checked)}
              checked={useTraining}
            />
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                <T>
                  Mark any new records as &#39;training&#39; and exclude from
                  all reports.
                </T>
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={share} size="small" slot="start" />
            <IonLabel>
              <T>Share App Analytics</T>
            </IonLabel>
            <Toggle
              onToggle={checked => onToggle('sendAnalytics', checked)}
              checked={sendAnalytics}
            />
          </IonItem>

          <IonItem id="app-reset-btn" onClick={() => resetDialog(resetApp)}>
            <IonIcon icon={undo} size="small" slot="start" />
            <T>Reset</T>
          </IonItem>
        </IonList>

        <p className="app-version">{`v${config.version} (${config.build})`}</p>
      </Main>
    );
  }
}

export default Component;
