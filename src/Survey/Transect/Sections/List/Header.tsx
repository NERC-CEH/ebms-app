import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import { IonButton } from '@ionic/react';

type Props = {
  showRefreshButton: boolean;
  onRefresh: () => void;
};

const HeaderComponent = ({ showRefreshButton, onRefresh }: Props) => {
  const title = showRefreshButton ? 'transect.transects' : 'transect.sections';

  const button = !showRefreshButton ? null : (
    <IonButton onClick={onRefresh}>
      <T>common.refresh</T>
    </IonButton>
  );

  return (
    <Header title={title} rightSlot={button} defaultHref="/home/user-surveys" />
  );
};

export default HeaderComponent;
