import { FC } from 'react';
import { IonSpinner, IonLabel, IonChip, IonButton } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Sample from 'models/sample';
import { observer } from 'mobx-react';
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
      <IonChip slot="end" class="record-status">
        <IonLabel>
          <T>Draft</T>
        </IonLabel>
      </IonChip>
    );
  }

  if (sample.remote.synchronising) {
    return <IonSpinner class="record-status" color="primary" />;
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
