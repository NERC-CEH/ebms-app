import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import { IonBadge } from '@ionic/react';
import './styles.scss';

function getPendingCount(samplesCollection) {
  const byUploadStatus = sample => !sample.metadata.syncedOn;

  return samplesCollection.filter(byUploadStatus).length;
}

function PendingSurveysBadge({ samplesCollection }) {
  const count = getPendingCount(samplesCollection);

  if (count <= 0) {
    return null;
  }

  return (
    <IonBadge color="warning" className="pending-surveys-badge">
      {count}
    </IonBadge>
  );
}

PendingSurveysBadge.propTypes = exact({
  samplesCollection: PropTypes.array.isRequired,
});

export default observer(PendingSurveysBadge);
