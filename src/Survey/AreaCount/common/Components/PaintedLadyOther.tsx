import { FC } from 'react';
import { observer } from 'mobx-react';
import i18n from 'i18next';
import { IonLabel } from '@ionic/react';

type Props = {
  text: string | string[];
};

export const PaintedLadyOther: FC<Props> = ({ text }) => {
  let prettifyValue = text;

  const eggLayingValues = Array.isArray(text);
  if (eggLayingValues) {
    const translate = (value: string) => i18n.t(value);
    prettifyValue = (prettifyValue as string[]).map(translate).join(', ');
  } else {
    prettifyValue = i18n.t(prettifyValue);
  }

  if (!text) return null;

  return <IonLabel className="other-value">{prettifyValue}</IonLabel>;
};

export default observer(PaintedLadyOther);
