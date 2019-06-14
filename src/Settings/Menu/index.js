import React from 'react';
import Log from 'helpers/log';
import savedSamples from 'saved_samples';
import appModel from 'app_model';
import userModel from 'user_model';
import AppHeader from 'common/Components/Header';
import Main from './Main';

function resetApp() {
  Log('Settings:Menu:Controller: resetting the application!', 'w');
  appModel.resetDefaults();
  userModel.logOut();
  return savedSamples.resetDefaults();
}

function onToggle(setting, checked) {
  Log('Settings:Menu:Controller: setting toggled.');
  appModel.set(setting, checked);
  appModel.save();
}

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
// }

const Container = () => {
  const useTraining = appModel.get('useTraining');

  return (
    <>
      <AppHeader title={t('Settings')} />
      <Main useTraining={useTraining} resetApp={resetApp} onToggle={onToggle} />
    </>
  );
};

Container.propTypes = {};

export default Container;
