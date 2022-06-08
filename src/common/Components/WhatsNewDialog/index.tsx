import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import appModelTypes from 'common/models/app';
import { IonBackdrop, IonIcon, IonButton } from '@ionic/react';
import butterflyIcon from 'common/images/butterfly.svg';
import appLogo from 'common/images/icon.svg';
import ExpandableList from 'Components/ExpandableList';
import './styles.scss';

type Props = {
  appModel: typeof appModelTypes;
};

const WhatsNewDialog: FC<Props> = ({ appModel }) => {
  const { showWhatsNewInVersion117, appSession } = appModel.attrs;

  const skipShowingDialogOnFreshInstall = () => {
    const isFreshInstall = appSession <= 1;
    if (isFreshInstall) {
      appModel.attrs.showWhatsNewInVersion117 = false; // eslint-disable-line
      appModel.save();
    }
  };
  useEffect(skipShowingDialogOnFreshInstall, [appSession]);

  if (!showWhatsNewInVersion117) return null;

  const closeDialog = () => {
    appModel.attrs.showWhatsNewInVersion117 = false; // eslint-disable-line
    appModel.save();
  };

  return (
    <div id="whats-new-dialog">
      <IonBackdrop tappable visible stopPropagation />

      <div className="wrapper">
        <div className="header">
          <IonIcon icon={butterflyIcon} className="butterfly-icon b1" />
          <IonIcon icon={butterflyIcon} className="butterfly-icon b2" />
          <IonIcon icon={butterflyIcon} className="butterfly-icon b3" />
          <IonIcon icon={butterflyIcon} className="butterfly-icon b4" />

          <IonIcon className="header-icon" icon={appLogo} />

          <h1>
            <T>What's New</T>
          </h1>
        </div>
        <div className="message">
          <ul>
            <ExpandableList>
              <li>
                <T>Improved user reports</T>
              </li>
              <li>
                <T>Added species guide search and filters</T>
              </li>
              <li>
                <T>Added Moth trap location setup</T>
              </li>
              <li>
                <T>Added new survey fields</T>
              </li>
              <li>
                <T>Increase temperature range selection from -0 to +40</T>
              </li>
              <li>
                <T>Added +5 species count shortcut</T>
              </li>
              <li>
                <T>Added a day-flying moths filter setting</T>
              </li>
              <li>
                <T>Updated species common names</T>
              </li>
              <li>
                <T>Added Polish and Romanian languages</T>
              </li>
              <li>
                <T>Added Catalan and Danish species common names</T>
              </li>
              <li>
                <T>Updated UI design</T>
              </li>
              <li>
                <T>Various bug fixes</T>
              </li>
              <li>
                <T>Updated translations</T>
              </li>
            </ExpandableList>
          </ul>
        </div>

        <IonButton onClick={closeDialog}>
          <T>Got it</T>
        </IonButton>
      </div>
    </div>
  );
};

export default observer(WhatsNewDialog);
