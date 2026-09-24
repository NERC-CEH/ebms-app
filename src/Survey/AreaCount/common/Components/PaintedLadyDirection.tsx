import { observer } from 'mobx-react';
import { IonLabel } from '@ionic/react';

type Props = {
  direction: string;
};

export const PaintedLadyDirection = ({ direction }: Props) => {
  if (!direction) return null;

  return <IonLabel className="other-value">{direction}</IonLabel>;
};

export default observer(PaintedLadyDirection);
