import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonLabel } from '@ionic/react';
import AppHeader from 'common/Components/Header';
import Toggle from 'common/Components/Toggle';
import './styles.scss';

const Header = observer(({ isGPSTracking, toggleGPStracking, isDisabled }) => {
  const GPSToggle = (
    <>
      <IonLabel>GPS</IonLabel>
      <Toggle
        className="survey-gps-toggle"
        checked={isGPSTracking}
        onToggle={toggleGPStracking}
      />
    </>
  );

  return <AppHeader title={t('Area')} rightSlot={!isDisabled && GPSToggle} />;
});

Header.propTypes = {
  toggleGPStracking: PropTypes.func.isRequired,
  isGPSTracking: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool,
};

export default Header;
