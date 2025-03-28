import { observer } from 'mobx-react';
import { prettyPrintLocation } from '@flumens';
import { IonSpinner } from '@ionic/react';
import './styles.scss';

function getValue(sample) {
  if (sample.isGPSRunning()) {
    return <IonSpinner />;
  }

  return prettyPrintLocation(sample.data.location);
}

// GridRefValue.propTypes = {
//   sample: PropTypes.object.isRequired,
// };
function GridRefValue({ sample }) {
  const value = getValue(sample);

  return <div className="gridref-label">{value}</div>;
}

export default observer(GridRefValue);
