import PropTypes from 'prop-types';
import { IonSpinner, IonLabel, IonChip, IonButton } from '@ionic/react';
import { Trans as T } from 'react-i18next';

import { observer } from 'mobx-react';
import './styles.scss';

function Component({ sample, onUpload }) {
  const isOldSurvey = !sample.getSurvey();
  if (isOldSurvey) return null;

  const { saved } = sample.metadata;
  if (!saved) {
    return (
      <IonChip slot="end" class="record-status">
        <IonLabel>{t('Draft')}</IonLabel>
      </IonChip>
    );
  }

  if (sample.remote.synchronising) {
    return <IonSpinner class="record-status" color="primary" />;
  }

  if (sample.isUploaded()) return null;

  return (
    <IonButton class="survey-status-upload" onClick={onUpload}>
      <T>Upload</T>
    </IonButton>
  );
}

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default observer(Component);
