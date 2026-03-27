import { observer } from 'mobx-react';
import { Main } from '@flumens';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import Location from 'models/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';

type Props = {
  traps: Location[];
  onTrapSelect: (trap: Location) => void;
};

const TrapPickerMain = ({ traps, onTrapSelect }: Props) => {
  const hasTraps = traps.length > 0;
  if (!hasTraps) {
    return (
      <Main className="ion-padding">
        <IonList lines="full">
          <InfoBackgroundMessage>
            No traps found for this site.
          </InfoBackgroundMessage>
        </IonList>
      </Main>
    );
  }

  const getTrapItem = (trap: Location) => {
    const trapName = trap.data.name || trap.data.code || 'Unnamed trap';

    const handleClick = () => onTrapSelect(trap);

    return (
      <IonItem key={trap.id} button onClick={handleClick} detail>
        <IonLabel className="ion-text-wrap">{trapName}</IonLabel>
      </IonItem>
    );
  };

  return (
    <Main className="ion-padding">
      <IonList lines="full">
        <div className="rounded-list">{traps.map(getTrapItem)}</div>
      </IonList>
    </Main>
  );
};

export default observer(TrapPickerMain);
