import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Toggle from 'common/Components/Toggle';
import { IonContent, IonIcon } from '@ionic/react';
import { undo, paperPlane, school, create, flame } from 'ionicons/icons';

import alert from 'common/helpers/alert';

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

function uploadDialog() {
  alert({
    header: t('Uplaod Started'),
    message: t('Your surveys are being uploaded now.'),
    buttons: [
      {
        text: t('OK'),
        role: 'cancel',
        cssClass: 'primary',
      },
    ],
  });
}

@observer
class Component extends React.Component {
  static propTypes = {
    resetApp: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    uploadAll: PropTypes.func.isRequired,
    useTraining: PropTypes.bool.isRequired,
    useExperiments: PropTypes.bool.isRequired,
    allowEdit: PropTypes.bool.isRequired,
  };

  render() {
    const {
      resetApp,
      onToggle,
      useTraining,
      useExperiments,
      allowEdit,
      uploadAll,
    } = this.props;

    const onUploadAll = () => {
      uploadAll();
      uploadDialog();
    };

    return (
      <>
        <IonContent>
          <ion-list lines="full">
            <ion-item-divider>{t('Records')}</ion-item-divider>
            <ion-item id="submit-all-btn" onClick={onUploadAll}>
              <IonIcon icon={paperPlane} size="small" slot="start" />
              {t('Upload All')}
            </ion-item>

            <ion-item-divider>{t('Application')}</ion-item-divider>
            <ion-item>
              <IonIcon icon={school} size="small" slot="start" />
              <ion-label>{t('Training Mode')}</ion-label>
              <Toggle
                onToggle={checked => onToggle('useTraining', checked)}
                checked={useTraining}
              />
            </ion-item>
            <ion-item id="app-reset-btn" onClick={() => resetDialog(resetApp)}>
              <IonIcon icon={undo} size="small" slot="start" />
              {t('Reset')}
            </ion-item>
            <ion-item>
              <IonIcon icon={flame} size="small" slot="start" />
              <ion-label>{t('Experimental Features')}</ion-label>
              <Toggle
                onToggle={checked => onToggle('useExperiments', checked)}
                checked={useExperiments}
              />
            </ion-item>
            {useExperiments && (
              <ion-item>
                <IonIcon icon={create} size="small" slot="start" />
                <ion-label>{t('Allow Sample Edit')}</ion-label>
                <Toggle
                  onToggle={checked => onToggle('allowEdit', checked)}
                  checked={allowEdit}
                />
              </ion-item>
            )}
          </ion-list>
        </IonContent>
      </>
    );
  }
}

export default Component;
