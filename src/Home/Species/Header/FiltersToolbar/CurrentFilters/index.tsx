import { FC } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { closeOutline } from 'ionicons/icons';
import { IonToolbar, IonIcon, IonChip, IonLabel } from '@ionic/react';
import {
  Filter as FilterValue,
  Filters,
  FilterGroupWithText as FilterGroup,
} from '..';
import './styles.scss';

type Filter = [FilterGroup, FilterValue[]];

const flattenFilterValuesByType = ([filterType, values]: Filter) => {
  const injectTypeBeforeValue = (value: FilterValue) => [filterType, value];
  return values.map(injectTypeBeforeValue);
};

type Props = {
  values: Filters;
  onRemove: any;
  searchPhrase?: string;
};

const CurrentFilters: FC<Props> = ({ searchPhrase, values, onRemove }) => {
  const getFilter = ([type, value]: [FilterGroup, FilterValue]) => {
    const removeFilterWrap = () => onRemove(type, value);

    const isTextType = type === 'text';
    const label = isTextType ? `"${value}"` : value;

    return (
      <IonChip
        key={value}
        className={clsx(isTextType && 'text')}
        outline
        onClick={removeFilterWrap}
      >
        <IonLabel>{label}</IonLabel>
        <IonIcon icon={closeOutline} />
      </IonChip>
    );
  };

  const flatFilters = (Object.entries(values) as Filter[]).flatMap(
    flattenFilterValuesByType
  ) as [FilterGroup, FilterValue][];

  if (searchPhrase) {
    flatFilters.unshift(['text', searchPhrase]);
  }

  const currentFilters = flatFilters.map(getFilter);

  if (!currentFilters.length) {
    return null;
  }

  return (
    <IonToolbar className="filterbar">
      <div>{currentFilters}</div>
    </IonToolbar>
  );
};

export default observer(CurrentFilters);
