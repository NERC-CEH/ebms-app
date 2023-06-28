import PropTypes from 'prop-types';
import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import { IonButton } from '@ionic/react';

function getRefreshButton(showRefreshButton, onRefresh) {
  if (!showRefreshButton) {
    return null;
  }
  return (
    <IonButton onClick={onRefresh}>
      <T>Refresh</T>
    </IonButton>
  );
}

const HeaderComponent = ({ showRefreshButton, onRefresh }) => {
  const title = showRefreshButton ? 'Transects' : 'Sections';

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
