import React from 'react';
import Log from 'helpers/log';
import { observer } from 'mobx-react';
import appModel from 'app_model';
import Toggle from 'common/Components/Toggle';
import { IonContent, IonPopover, IonIcon } from '@ionic/react';
import AppHeader from 'common/Components/Header';

// function deleteAllSamples(savedSamples) {
//   const body = `${t(
//     'Are you sure you want to remove all successfully synchronised local records?'
//   )}<p><i><b>${t('Note')}:</b> ${t(
//     'records on the server will not be touched.'
//   )}</i></p>`;

//   radio.trigger('app:dialog', {
//     title: 'Remove All',
//     body,
//     buttons: [
//       {
//         title: 'Cancel',
//         fill: 'clear',
//         onClick() {
//           radio.trigger('app:dialog:hide');
//         },
//       },
//       {
//         title: 'Remove',
//         color: 'danger',
//         onClick() {
//           Log('Settings:Menu:Controller: deleting all samples.');

//           // delete all
//           savedSamples
//             .removeAllSynced()
//             .then(() => {
//               radio.trigger('app:dialog', {
//                 title: 'Done!',
//                 timeout: 1000,
//               });
//             })
//             .catch(err => {
//               Log(err, 'e');
//               radio.trigger('app:dialog:error', err);
//             });
//           Analytics.trackEvent('Settings', 'delete all');
//         },
//       },
//     ],
//   });
// }

// function sendAllSamples(savedSamples) {
//   radio.trigger('app:dialog', {
//     title: 'Submit All',
//     body: 'Are you sure you want to set all valid records for submission?',
//     buttons: [
//       {
//         title: 'Cancel',
//         fill: 'clear',
//         onClick() {
//           radio.trigger('app:dialog:hide');
//         },
//       },
//       {
//         title: 'Submit',
//         onClick() {
//           Log('Settings:Menu:Controller: sending all samples.');
//           savedSamples
//             .setAllToSend()
//             .then(() => {
//               radio.trigger('app:dialog', {
//                 title: 'Done!',
//                 timeout: 1000,
//               });
//             })
//             .catch(err => {
//               Log(err, 'e');
//               radio.trigger('app:dialog:error', err);
//             });
//           Analytics.trackEvent('Settings', 'send all');
//         },
//       },
//     ],
//   });
// }

// function resetApp(savedSamples, appModel, userModel) {
//   Log('Settings:Menu:Controller: resetting the application!', 'w');
//   Analytics.trackEvent('Settings', 'reset app');

//   appModel.resetDefaults();
//   userModel.logOut();
//   return savedSamples.resetDefaults();
// }

// function resetDialog(savedSamples, appModel, userModel) {
//   radio.trigger('app:dialog', {
//     title: 'Reset',
//     class: 'error',
//     body: `${t(
//       'Are you sure you want to reset the application to its initial state?'
//     )}<p><b>${t('This will wipe all the locally stored app data!')}</b></p>`,
//     buttons: [
//       {
//         title: 'Cancel',
//         fill: 'clear',
//         onClick() {
//           radio.trigger('app:dialog:hide');
//         },
//       },
//       {
//         title: 'Reset',
//         color: 'danger',
//         onClick() {
//           // delete all
//           resetApp(savedSamples, appModel, userModel).then(() => {
//             radio.trigger('app:dialog', {
//               title: 'Done!',
//               timeout: 1000,
//             });
//           });
//         },
//       },
//     ],
//   });
// }

@observer
class Component extends React.Component {
  state = { showPopover: false };

  onToggle = (setting, checked) => {
    Log('Settings:Menu:Controller: setting toggled.');
    appModel.set(setting, checked);
    appModel.save();
  };

  setShowPopover = val => {
    this.setState({ showPopover: val });
  };

  render() {
    const useTraining = appModel.get('useTraining');
    const useExperiments = appModel.get('useExperiments');

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
        <AppHeader title={t('Settings')} />
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
                onToggle={checked => this.onToggle('useTraining', checked)}
                checked={useTraining}
              />
            </ion-item>
            <ion-item>
              <IonIcon name="flame" size="small" slot="start" />
              <ion-label>{t('Experimental Features')}</ion-label>
              <Toggle
                onToggle={checked => this.onToggle('useExperiments', checked)}
                checked={useExperiments}
              />
            </ion-item>
            <ion-item
              id="app-reset-btn"
              onClick={() => this.setShowPopover(true)}
              // onClick={() => resetDialog(savedSamples, appModel, userModel)}
            >
              <IonIcon name="undo" size="small" slot="start" />
              {t('Reset')}
            </ion-item>
          </ion-list>
        </IonContent>
      </>
    );
  }
}

Component.propTypes = {};

export default Component;
