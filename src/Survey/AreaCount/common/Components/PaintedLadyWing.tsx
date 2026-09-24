import { observer } from 'mobx-react';
import i18n from 'i18next';
import { Badge } from '@flumens';
import getSurveyValueKey from 'Survey/common/translationKeys';

type Props = {
  wings: string[];
};

export const PaintedLadyWing = ({ wings }: Props) => {
  if (!wings?.length) return null;

  const label = wings.map(wing => {
    const key = getSurveyValueKey(wing);
    const translatedWing = key ? i18n.t(key as never) : wing;
    return `${translatedWing[0]} `;
  });

  return <Badge skipTranslation>{label}</Badge>;
};

export default observer(PaintedLadyWing);
