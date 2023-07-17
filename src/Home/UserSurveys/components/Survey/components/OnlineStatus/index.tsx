import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonSpinner, IonLabel, IonChip, IonButton } from '@ionic/react';
import Sample from 'models/sample';
import './styles.scss';

type Props = {
  sample: Sample;
  onUpload: (e?: any) => void;
  hasManyPending?: boolean;
};

const OnlineStatus: FC<Props> = ({ sample, onUpload, hasManyPending }) => {
  const { deprecated } = sample.getSurvey();
  if (deprecated) return null;

  const { saved } = sample.metadata;
  if (!saved) {
    return (
      <IonChip slot="end" className="record-status">
        <IonLabel>
          <T>Draft</T>
        </IonLabel>
      </IonChip>
    );
  }

  if (sample.remote.synchronising) {
    return <IonSpinner className="record-status" color="primary" />;
  }

  if (sample.isUploaded()) return null;

  const isValid = !sample.validateRemote();

  return (
    <IonButton
      color={isValid ? 'secondary' : 'medium'}
      fill={hasManyPending ? 'outline' : 'solid'}
      shape="round"
      className="primary-button"
      onClick={onUpload}
    >
      <T>Upload</T>
    </IonButton>
  );
};

export default observer(OnlineStatus);
