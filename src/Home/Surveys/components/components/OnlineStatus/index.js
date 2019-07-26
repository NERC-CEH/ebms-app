import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'common/Components/Spinner';
import { observer } from 'mobx-react';
import { IonIcon } from '@ionic/react';
import { paperPlane } from 'ionicons/icons';
import './styles.scss';

const Component = observer(props => {
  const { sample } = props;
  const { saved } = sample.metadata;

  if (!saved) {
    return null;
  }

  if (sample.remote.synchronising) {
    return <Spinner />;
  }

  const statusClass = sample.metadata.server_on ? 'sent' : 'unsent';

  return (
    <IonIcon
      slot="end"
      icon={paperPlane}
      size="small"
      className={`survey-status ${statusClass}`}
    />
  );
});

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
