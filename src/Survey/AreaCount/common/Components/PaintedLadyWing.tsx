import { FC } from 'react';
import { observer } from 'mobx-react';
import i18n from 'i18next';
import { Badge } from '@flumens';

type Props = {
  wings: string[];
};

export const PaintedLadyWing: FC<Props> = ({ wings }) => {
  if (!wings?.length) return null;

  const label = wings.map((wing: string) => `${i18n.t(wing)[0]} `);

  return <Badge>{label}</Badge>;
};

export default observer(PaintedLadyWing);
