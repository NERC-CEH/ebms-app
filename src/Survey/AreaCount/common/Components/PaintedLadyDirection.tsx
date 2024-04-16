import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { IonLabel } from '@ionic/react';

type Props = {
  direction: string;
};

export const PaintedLadyDirection = ({ direction }: Props) => {
  if (!direction) return null;

  return (
    <IonLabel className="other-value">
      <T>{direction}</T>
    </IonLabel>
  );
};

export default observer(PaintedLadyDirection);
