import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import appModelTypes from 'common/models/app';
import { IonBackdrop, IonIcon, IonButton } from '@ionic/react';
import butterflyIcon from 'common/images/butterfly.svg';
import appLogo from 'common/images/icon.svg';
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
          <p>
            <h3>
              <T>Added Polish and Romanian languages</T>
            </h3>
          </p>

          <p>
            <h3>
              <T>Added Moth trap location setup</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Increase temperature range selection from -0 to +40</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Added a day-flying moths filter setting</T>
            </h3>
          </p>

          <p>
            <h3>
              <T>Added +5 species count shortcut</T>
            </h3>
          </p>

          <p>
            <h3>
              <T>Added species guide search and filters</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Updated species common names</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Added Catalan and Danish species common names</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Added new survey fields</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Improved user reports</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Updated UI design</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Various bug fixes</T>
            </h3>
          </p>
          <p>
            <h3>
              <T>Updated translations</T>
            </h3>
          </p>
        </div>

        <IonButton onClick={closeDialog}>
          <T>Got it</T>
        </IonButton>
      </div>
    </div>
  );
};

export default observer(WhatsNewDialog);
