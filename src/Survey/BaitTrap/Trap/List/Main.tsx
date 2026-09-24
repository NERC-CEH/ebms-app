import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { Main } from '@flumens';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import Location from 'models/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

type Props = {
  traps: Location[];
  onTrapSelect: (trap: Location) => void;
};

const TrapPickerMain = ({ traps, onTrapSelect }: Props) => {
  const { t } = useTranslation();
  const hasTraps = traps.length > 0;
  if (!hasTraps) {
    return (
      <Main className="ion-padding pb-ion-s-10">
        <IonList lines="full">
          <InfoBackgroundMessage>bait.noTrapsSite</InfoBackgroundMessage>
        </IonList>
      </Main>
    );
  }

  const getTrapItem = (trap: Location) => {
    const trapName =
      trap.data.name || trap.data.code || t('locations.unnamedTrap');

    const handleClick = () => onTrapSelect(trap);

    return (
      <IonItem key={trap.id} button onClick={handleClick} detail>
        <IonLabel className="ion-text-wrap">{trapName}</IonLabel>
      </IonItem>
    );
  };

  const sortedTraps = [...traps].sort((a, b) => {
    const nameA = a.data.name || a.data.code || '';
    const nameB = b.data.name || b.data.code || '';
    return nameA.localeCompare(nameB);
  });

  return (
    <Main className="ion-padding pb-ion-s-10">
      <IonList lines="full">
        <div className="rounded-list">{sortedTraps.map(getTrapItem)}</div>
      </IonList>
    </Main>
  );
};

export default observer(TrapPickerMain);
