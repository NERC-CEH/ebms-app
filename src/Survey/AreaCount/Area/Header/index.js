import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonTitle, IonToolbar, IonLabel } from '@ionic/react';
import AppHeader from 'common/Components/Header';
import Toggle from 'common/Components/Toggle';
import './styles.scss';

const Header = observer(({ sample, isGPSTracking, toggleGPStracking }) => {
  const location = sample.get('location') || {};
  const { area } = location;

  let areaPretty;
  if (area) {
    areaPretty = `${t('Selected area')}: ${area.toLocaleString()} m²`;
  } else {
    areaPretty = t('Please draw your area on the map');
  }

  const GPSToggle = (
    <>
      <IonLabel>GPS</IonLabel>
      <Toggle className="survey-gps-toggle" checked={isGPSTracking} onToggle={toggleGPStracking} />
    </>
  );

  return (
    <>
      <AppHeader title={t('Area')} rightSlot={GPSToggle} />
      <IonToolbar id="area-edit-toolbar">
        <IonTitle slot="start">{areaPretty}</IonTitle>
      </IonToolbar>
    </>
  );
});

Header.propTypes = {
  sample: PropTypes.object.isRequired,
  toggleGPStracking: PropTypes.func.isRequired,
  isGPSTracking: PropTypes.bool.isRequired,
};

export default Header;
