import { useTranslation } from 'react-i18next';
import { getRelativeDate } from '@flumens';

type Props = { date: string | number | Date };

const RelativeDate = ({ date }: Props) => {
  const { t } = useTranslation();
  const value = getRelativeDate(date);

  if (value === 'Today') return t('common.today');
  if (value === 'Yesterday') return t('common.yesterday');

  return value;
};

export default RelativeDate;
