import React from 'react';
import PropTypes from 'prop-types';
import { IonSpinner } from '@ionic/react';

import { observer } from 'mobx-react';
import './styles.scss';

const Component = observer(props => {
  const { sample } = props;
  const { saved } = sample.metadata;

  if (!saved) {
    return null;
  }

  if (!sample.remote.synchronising) {
    return null;
  }

  return <IonSpinner class="survey-status" />;
});

Component.propTypes = {
  sample: PropTypes.object.isRequired,
  isDefaultSurvey: PropTypes.bool,
};

export default Component;
