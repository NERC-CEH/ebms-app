import React from 'react';
import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import Header from 'Lib/Header';

function getRefreshButton(showRefreshButton, onRefresh) {
  if (!showRefreshButton) {
    return null;
  }
  return <IonButton onClick={onRefresh}>{t('Refresh')}</IonButton>;
}

const HeaderComponent = ({ showRefreshButton, onRefresh }) => {
  const title = showRefreshButton ? t('Transects') : t('Sections');

  return (
    <Header
      title={title}
      rightSlot={getRefreshButton(showRefreshButton, onRefresh)}
      defaultHref="/home/user-surveys"
    />
  );
};

HeaderComponent.propTypes = {
  showRefreshButton: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default HeaderComponent;
