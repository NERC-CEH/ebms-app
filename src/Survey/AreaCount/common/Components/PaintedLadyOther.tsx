import { observer } from 'mobx-react';
import i18n from 'i18next';
import getSurveyValueKey from 'Survey/common/translationKeys';

type Props = {
  text: string | string[];
};

export const PaintedLadyOther = ({ text }: Props) => {
  const translate = (value: string) => {
    const key = getSurveyValueKey(value);
    return key ? i18n.t(key as never) : value;
  };
  const prettifyValue = Array.isArray(text)
    ? text.map(translate).join(', ')
    : translate(text);

  if (!text) return null;

  return (
    <div className="line-clamp-1 max-w-[200px] text-sm items-center flex">
      {prettifyValue}
    </div>
  );
};

export default observer(PaintedLadyOther);
