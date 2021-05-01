import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonLabel } from '@ionic/react';
import { Header, Toggle, alert } from '@apps';
import './styles.scss';

const HeaderComponent = ({ isGPSTracking, toggleGPStracking, isDisabled }) => {
  const [id, rerender] = useState(0);

  const onToggle = on => {
    if (on === isGPSTracking) {
      return;
    }

    if (isGPSTracking && !on) {
      alert({
        header: 'Warning',
        message: t('Are you sure you want to turn off the GPS tracking?'),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => rerender(id + 1),
          },
          {
            text: 'Turn off',
            cssClass: 'secondary',
            handler: () => toggleGPStracking(false),
          },
        ],
      });
      return;
    }

    toggleGPStracking(on);
  };

  const GPSToggle = (
    <>
      <IonLabel>GPS</IonLabel>
      <Toggle
        className="survey-gps-toggle"
        color="success"
        checked={isGPSTracking}
        onToggle={onToggle}
      />
    </>
  );

  return <Header title="Area" rightSlot={!isDisabled && GPSToggle} />;
};

HeaderComponent.propTypes = {
  toggleGPStracking: PropTypes.func.isRequired,
  isGPSTracking: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
};

export default observer(HeaderComponent);
