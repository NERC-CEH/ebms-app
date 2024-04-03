import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import { IonButton } from '@ionic/react';

type Props = {
  showRefreshButton: boolean;
  onRefresh: any;
};

const HeaderComponent = ({ showRefreshButton, onRefresh }: Props) => {
  const title = showRefreshButton ? 'Transects' : 'Sections';

  const button = !showRefreshButton ? null : (
    <IonButton onClick={onRefresh}>
      <T>Refresh</T>
    </IonButton>
  );

  return (
    <Header title={title} rightSlot={button} defaultHref="/home/user-surveys" />
  );
};

export default HeaderComponent;
