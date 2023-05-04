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
  const { showWhatsNewInVersion121, appSession } = appModel.attrs;

  const skipShowingDialogOnFreshInstall = () => {
    const isFreshInstall = appSession <= 1;
    if (isFreshInstall) {
      appModel.attrs.showWhatsNewInVersion121 = false; // eslint-disable-line
      appModel.save();
    }
  };
  useEffect(skipShowingDialogOnFreshInstall, [appSession]);

  if (!showWhatsNewInVersion121) return null;

  const closeDialog = () => {
    appModel.attrs.showWhatsNewInVersion121 = false; // eslint-disable-line
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
                <summary>
                  <T>Added Painted Lady survey</T>
                </summary>
              </li>
              <li>
                <summary>
                  <T>Changed Species groups location and functionality</T>
                </summary>
              </li>
              <li>
                <summary>
                  <T>Various bug fixes</T>
                </summary>
              </li>
              <li>
                <summary>
                  <T>Updated translations</T>
                </summary>
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
