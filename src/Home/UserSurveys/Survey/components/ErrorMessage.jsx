import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { IonItemDivider, IonLabel } from '@ionic/react';

function ErrorMessage({ sample }) {
  if (!sample.error.message) {
    return null;
  }

  return (
    <IonItemDivider color="danger">
      <IonLabel className="ion-text-wrap">
        <b>{`${t('Upload')}: `}</b> {t(sample.error.message)}
      </IonLabel>
    </IonItemDivider>
  );
}

ErrorMessage.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default observer(ErrorMessage);