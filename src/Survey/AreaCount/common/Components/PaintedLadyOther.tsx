import { observer } from 'mobx-react';
import i18n from 'i18next';

type Props = {
  text: string | string[];
};

export const PaintedLadyOther = ({ text }: Props) => {
  let prettifyValue = text;

  const eggLayingValues = Array.isArray(text);
  if (eggLayingValues) {
    const translate = (value: string) => i18n.t(value);
    prettifyValue = (prettifyValue as string[]).map(translate).join(', ');
  } else {
    prettifyValue = i18n.t(prettifyValue);
  }

  if (!text) return null;

  return (
    <div className="line-clamp-1 max-w-[200px] text-sm">{prettifyValue}</div>
  );
};

export default observer(PaintedLadyOther);
