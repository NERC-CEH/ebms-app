import React from 'react';
import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import AppHeader from 'Components/Header';

function getRefreshButton(showRefreshButton, onRefresh) {
  if (!showRefreshButton) {
    return null;
  }
  return <IonButton onClick={onRefresh}>{t('Refresh')}</IonButton>;
}

const Header = ({ showRefreshButton, onRefresh }) => {
  const title = showRefreshButton ? t('Transects') : t('Sections');

  return (
    <AppHeader
      title={title}
      rightSlot={getRefreshButton(showRefreshButton, onRefresh)}
      defaultHref="/home/user-surveys"
    />
  );
};

Header.propTypes = {
  showRefreshButton: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default Header;
