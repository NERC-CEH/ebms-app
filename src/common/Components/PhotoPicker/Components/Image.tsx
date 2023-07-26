/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { FC } from 'react';
import { observer } from 'mobx-react';
import { warningOutline, close } from 'ionicons/icons';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import Media from 'models/media';
import '../styles.scss';

type Props = {
  media: Media;
  isDisabled: boolean;
  onDelete: any;
  onClick: any;
};

const Image: FC<Props> = ({ media, isDisabled, onDelete, onClick }) => {
  const showWarning = !media.isDisabled() && !media.doesTaxonMatchParent();

  const showLoading = media.identification.identifying;

  const onClickWrap = () => !showLoading && onClick();

  return (
    <div className="img">
      {!isDisabled && (
        <IonButton fill="clear" className="delete" onClick={onDelete}>
          <IonIcon icon={close} />
        </IonButton>
      )}
      <img src={media.getURL()} onClick={onClickWrap} />

      {showLoading && <IonSpinner slot="end" className="identifying" />}
      {!showLoading && showWarning && (
        <IonIcon className="warning-icon" icon={warningOutline} />
      )}
    </div>
  );
};

export default observer(Image);
