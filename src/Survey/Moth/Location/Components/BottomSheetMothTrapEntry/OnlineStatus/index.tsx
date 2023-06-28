import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonLabel, IonChip, IonButton, IonSpinner } from '@ionic/react';
import Location from 'models/location';
import './styles.scss';

type Props = {
  location: Location;
  onUpload: any;
};
const OnlineStatus: FC<Props> = ({ location, onUpload }) => {
  const { saved } = location.metadata;

  if (!saved) {
    return (
      <IonChip slot="end" class="record-status">
        <IonLabel>
          <T>Draft</T>
        </IonLabel>
      </IonChip>
    );
  }

  if (location.remote.synchronising) {
    return <IonSpinner class="record-status" color="primary" />;
  }

  if (location.isUploaded()) {
    return null;
  }

  const onUploadWrap = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    onUpload();
  };
  return (
    <IonButton
      color="secondary"
      fill="solid"
      shape="round"
      className="primary-button"
      onClick={onUploadWrap}
    >
      <T>Upload</T>
    </IonButton>
  );
};

export default observer(OnlineStatus);
