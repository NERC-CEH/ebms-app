import React from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Toggle from 'common/Components/Toggle';
import { IonContent, IonPopover, IonIcon } from '@ionic/react';
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

@observer
class Component extends React.Component {
  static propTypes = {
    resetApp: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    useTraining: PropTypes.bool.isRequired,
    useExperiments: PropTypes.bool.isRequired,
    allowEdit: PropTypes.bool.isRequired,
  };

  state = { showPopover: false };

  setShowPopover = val => {
    this.setState({ showPopover: val });
  };

  render() {
    const {
      resetApp,
      onToggle,
      useTraining,
      useExperiments,
      allowEdit,
    } = this.props;

    const ToDoPopover = (
      <IonPopover
        isOpen={this.state.showPopover}
        onDidDismiss={() => {
          this.setShowPopover(false);
        }}
      >
        <small style={{ padding: '30px' }}>
          <center>TODO: implement</center>
        </small>
      </IonPopover>
    );

    return (
      <>
        {ToDoPopover}
        <IonContent>
          <ion-list lines="full">
            <ion-item-divider>{t('Records')}</ion-item-divider>
            <ion-item
              id="submit-all-btn"
              onClick={() => this.setShowPopover(true)}
              // onClick={() => sendAllSamples(savedSamples)}
            >
              <IonIcon name="paper-plane" size="small" slot="start" />
              {t('Submit All')}
            </ion-item>
            <ion-item
              id="delete-all-btn"
              onClick={() => this.setShowPopover(true)}
              // onClick={() => deleteAllSamples(savedSamples)}
            >
              <IonIcon name="trash" size="small" slot="start" />
              {t('Remove All Saved')}
            </ion-item>

            <ion-item-divider>{t('Application')}</ion-item-divider>
            <ion-item>
              <IonIcon name="school" size="small" slot="start" />
              <ion-label>{t('Training Mode')}</ion-label>
              <Toggle
                onToggle={checked => onToggle('useTraining', checked)}
                checked={useTraining}
              />
            </ion-item>
            <ion-item id="app-reset-btn" onClick={() => resetDialog(resetApp)}>
              <IonIcon name="undo" size="small" slot="start" />
              {t('Reset')}
            </ion-item>
            <ion-item>
              <IonIcon name="fire" size="small" slot="start" />
              <ion-label>{t('Experimental Features')}</ion-label>
              <Toggle
                onToggle={checked => onToggle('useExperiments', checked)}
                checked={useExperiments}
              />
            </ion-item>
            {useExperiments && (
              <ion-item>
                <IonIcon name="pen" size="small" slot="start" />
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
