import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonTitle, IonToolbar } from '@ionic/react';
import AppHeader from 'common/Components/Header';

const Header = observer(({ sample }) => {
  const location = sample.get('location') || {};
  const { area } = location;

  let areaPretty;
  if (area) {
    areaPretty = `${t('Selected area')}: ${area.toLocaleString()} m²`;
  } else {
    areaPretty = t('Please draw your area on the map');
  }

  return (
    <>
      <AppHeader title={t('Area')} />
      <IonToolbar id="area-edit-toolbar">
        <IonTitle slot="start">{areaPretty}</IonTitle>
      </IonToolbar>
    </>
  );
});

Header.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default Header;
