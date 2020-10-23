import React from 'react';
import PropTypes from 'prop-types';
import { IonSpinner } from '@ionic/react';
import { observer } from 'mobx-react';
import { prettyPrintLocation } from '@bit/flumens.apps.utils.location';
import './styles.scss';

function getValue(sample) {
  if (sample.isGPSRunning()) {
    return <IonSpinner />;
  }

  return prettyPrintLocation(sample.attrs.location);
}

function GridRefValue({ sample }) {
  const value = getValue(sample);

  return <div className="gridref-label">{value}</div>;
}

GridRefValue.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default observer(GridRefValue);
