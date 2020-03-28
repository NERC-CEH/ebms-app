import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonLabel } from '@ionic/react';
import Header from 'Lib/Header';
import Toggle from 'Lib/Toggle';
import './styles.scss';

const HeaderComponent = observer(
  ({ isGPSTracking, toggleGPStracking, isDisabled }) => {
    const GPSToggle = (
      <>
        <IonLabel>GPS</IonLabel>
        <Toggle
          className="survey-gps-toggle"
          color="success"
          checked={isGPSTracking}
          onToggle={toggleGPStracking}
        />
      </>
    );

    return <Header title={t('Area')} rightSlot={!isDisabled && GPSToggle} />;
  }
);

HeaderComponent.propTypes = {
  toggleGPStracking: PropTypes.func.isRequired,
  isGPSTracking: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
};

export default HeaderComponent;
