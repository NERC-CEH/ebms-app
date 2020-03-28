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
          <IonItemDivider>{t('Records')}</IonItemDivider>
          <IonItem
            id="submit-all-btn"
            onClick={() => uploadAllSamplesDialog(uploadAllSamples)}
          >
            <IonIcon icon={paperPlane} size="small" slot="start" />
            <IonLabel>{t('Upload All')}</IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                {t(
                  "Batch upload all finished records. This does not include records in 'draft' stage."
                )}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItemDivider>{t('Application')}</IonItemDivider>
          <IonItem routerLink="/settings/language">
            <IonLabel>{t('Language')}</IonLabel>
            <IonIcon icon={flag} size="small" slot="start" />
            <IonLabel slot="end">{languages[language]}</IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/country">
            <IonLabel>{t('Country')}</IonLabel>
            <IonIcon icon={globe} size="small" slot="start" />
            <IonLabel slot="end">{t(countries[country])}</IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={school} size="small" slot="start" />
            <IonLabel>{t('Training Mode')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('useTraining', checked)}
              checked={useTraining}
            />
          </IonItem>
          <IonItem>
            <IonLabel class="ion-text-wrap">
              <IonNote color="primary">
                {t(
                  "Mark any new records as 'training' and exclude from all reports."
                )}
              </IonNote>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={share} size="small" slot="start" />
            <IonLabel>{t('Share App Analytics')}</IonLabel>
            <Toggle
              onToggle={checked => onToggle('sendAnalytics', checked)}
              checked={sendAnalytics}
            />
          </IonItem>

          <IonItem id="app-reset-btn" onClick={() => resetDialog(resetApp)}>
            <IonIcon icon={undo} size="small" slot="start" />
            {t('Reset')}
          </IonItem>
        </IonList>

        <p className="app-version">{`v${config.version} (${config.build})`}</p>
      </Main>
    );
  }
}

export default Component;
