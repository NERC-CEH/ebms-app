import { FC } from 'react';
import { observer } from 'mobx-react';
import { IonLabel } from '@ionic/react';
import { Trans as T } from 'react-i18next';

type Props = {
  behaviour: string;
  showLabel?: boolean;
};

interface Type {
  [key: string]: string;
}

const BEHAVIOUR_COLOURS: Type = {
  Migrating: '#0d20aa',
  Mating: '#ff4e4e',
  'Egg-laying hostplants': '#37b542',
  Nectaring: '#c6b125',
};

export const PaintedLadyBehaviour: FC<Props> = ({ behaviour, showLabel }) => {
  if (!behaviour) return null;

  const color = BEHAVIOUR_COLOURS[behaviour];

  return (
    <div className="behaviour-label">
      <div
        className="icon"
        style={{
          background: color,
        }}
      />
      {showLabel && (
        <IonLabel>
          <T>{behaviour}</T>
        </IonLabel>
      )}
    </div>
  );
};

export default observer(PaintedLadyBehaviour);
