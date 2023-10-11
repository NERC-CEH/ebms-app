// import { FC, useEffect } from 'react';
// import { observer } from 'mobx-react';
// import { Trans as T } from 'react-i18next';
// import { IonBackdrop, IonIcon } from '@ionic/react';
// import butterflyIcon from 'common/images/butterfly.svg';
import 'common/images/icon.svg';
// import appLogo from 'common/images/icon.svg';
// import appModelTypes from 'common/models/app';
// import ExpandableList from 'Components/ExpandableList';
import './styles.scss';

// type Props = {
//   appModel: typeof appModelTypes;
// };

// const WhatsNewDialog: FC<Props> = ({ appModel }) => {
//   const { showWhatsNew, showWhatsNewInVersion122, appSession } = appModel.attrs;

//   const skipShowingDialogOnFreshInstall = () => {
//     const isFreshInstall = appSession <= 1;
//     if (isFreshInstall) {
//       appModel.attrs.showWhatsNewInVersion122 = false; // eslint-disable-line
//       appModel.save();
//     }
//   };
//   useEffect(skipShowingDialogOnFreshInstall, [appSession]);

//   if (!showWhatsNew) return null;

//   if (!showWhatsNewInVersion122) return null;

//   const closeDialog = () => {
//     appModel.attrs.showWhatsNewInVersion122 = false; // eslint-disable-line
//     appModel.save();
//   };

//   const hideFutureDialogs = () => {
//     appModel.attrs.showWhatsNew = false; // eslint-disable-line
//     appModel.save();
//   };

//   return (
//     <div id="whats-new-dialog">
//       <IonBackdrop tappable visible stopPropagation />

//       <div className="wrapper">
//         <div className="header">
//           <IonIcon icon={butterflyIcon} className="butterfly-icon b1" />
//           <IonIcon icon={butterflyIcon} className="butterfly-icon b2" />
//           <IonIcon icon={butterflyIcon} className="butterfly-icon b3" />
//           <IonIcon icon={butterflyIcon} className="butterfly-icon b4" />

//           <IonIcon className="header-icon" icon={appLogo} />

//           <h1>
//             <T>What's New</T>
//           </h1>
//         </div>
//         <div className="message">
//           <ul>
//             <ExpandableList maxItems={3}>
//               <li>
//                 <summary>
//                   <T>
//                     Added capability to view records that have been uploaded
//                     from other devices.
//                   </T>
//                 </summary>
//               </li>

//               <li>
//                 <summary>
//                   <T>
//                     The records map has been upgraded to display all user
//                     records.
//                   </T>
//                 </summary>
//               </li>

//               <li>
//                 <summary>
//                   <T>
//                     Enabled copying of the previous transect section's species
//                     list.
//                   </T>
//                 </summary>
//               </li>

//               <li>
//                 <summary>
//                   <T>
//                     Enabled copying of the previous moth trap's species list.
//                   </T>
//                 </summary>
//               </li>

//               <li>
//                 <summary>
//                   <T>Updated species guide page.</T>
//                 </summary>
//               </li>

//               <li>
//                 <summary>
//                   <T>Added option to clear uploaded cached files.</T>
//                 </summary>
//               </li>
//             </ExpandableList>
//           </ul>
//         </div>

//         <div className="whats-new-dialog-buttons">
//           <div className="button" onClick={hideFutureDialogs}>
//             <T>Don't show again</T>
//           </div>
//           <div className="button" onClick={closeDialog}>
//             <T>Got it</T>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default observer(WhatsNewDialog);

// eslint-disable-next-line
export default (args: any) => null;
