import { FC } from 'react';
import { observer } from 'mobx-react';
import i18n from 'i18next';
import { IonLabel, IonBadge } from '@ionic/react';

type Props = {
  wings: string[];
};

export const PaintedLadyWing: FC<Props> = ({ wings }) => {
  if (!wings?.length) return null;

  const label = wings.map((wing: string) => `${i18n.t(wing)[0]} `);

  return (
    <IonBadge color="medium">
      <IonLabel className="wing-value">{label}</IonLabel>
    </IonBadge>
  );
};

export default observer(PaintedLadyWing);
