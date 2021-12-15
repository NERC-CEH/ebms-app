import React, { FC } from 'react';
import { IonIcon, IonButton, IonSpinner } from '@ionic/react';
import { observer } from 'mobx-react';
import { warningOutline, close } from 'ionicons/icons';
import Media from 'models/media';
import '../styles.scss';

type Props = {
  media: typeof Media;
  isDisabled: boolean;
  onDelete: any;
  onClick: any;
};

const Image: FC<Props> = ({ media, isDisabled, onDelete, onClick }) => {
  const showWarning =
    !media.doesTaxonMatchParent() ||
    typeof media.doesTaxonMatchParent() === 'string'; // calculate from media.parent

  const showLoading = media.identification.identifying;

  return (
    <div className="img">
      {!isDisabled && (
        <IonButton fill="clear" class="delete" onClick={onDelete}>
          <IonIcon icon={close} />
        </IonButton>
      )}
      <img src={media.attrs.thumbnail} onClick={onClick} />

      {showLoading && <IonSpinner slot="end" className="identifying" />}
      {!showLoading && showWarning && (
        <IonIcon className="warning-icon" icon={warningOutline} />
      )}
    </div>
  );
};

export default observer(Image);
