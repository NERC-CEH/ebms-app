import { observer } from 'mobx-react';
import { Collapse } from '@flumens';
import { IonContent, IonList, IonCol, IonRow, IonGrid } from '@ionic/react';
import { Filters } from '..';
import './styles.scss';

export type FilterOption<T = string> = {
  type: T;
  values: string[];
  render?: any;
};

export type Props = {
  values: Filters;
  options: any;
  onSelect: any;
  searchPhrase?: string;
};

const Menu = ({ searchPhrase, values, onSelect, options }: Props) => {
  const getFilterOptions = ({
    type,
    values: optionValues,
    render,
  }: FilterOption) => {
    let filterOptions = [...optionValues];

    const notSelected = (value: string) =>
      !values[type] || !values[type]?.includes(value);
    const matchesSearchString = (value: string) =>
      searchPhrase
        ? value?.toLowerCase().includes(searchPhrase.toLowerCase())
        : true;

    filterOptions = filterOptions
      .filter(notSelected)
      .filter(matchesSearchString);

    if (!filterOptions.length) return null;

    const getOption = (value: string) => {
      const toggleFilterWrap = () => onSelect(type, value);

      const filterLabel = render ? render(value) : value;

      return (
        <IonCol key={value} size="6" onClick={toggleFilterWrap}>
          {filterLabel}
        </IonCol>
      );
    };

    const filterTypeOptions = filterOptions.map(getOption);

    const shouldOpenCollapse = !!searchPhrase || options.length <= 1;
    const otherProps = shouldOpenCollapse && {
      groupProps: { value: type },
      value: type,
    };

    return (
      <Collapse key={type} title={type} {...otherProps}>
        <IonGrid>
          <IonRow>{filterTypeOptions}</IonRow>
        </IonGrid>
      </Collapse>
    );
  };

  const filterOptions = options.map(getFilterOptions);

  const hasFilters = !!filterOptions.find((val: any) => !!val); // eslint-disable-line @getify/proper-arrows/name
  if (!hasFilters) return null;

  return (
    <IonContent slot="fixed" className="filters">
      <IonList>{filterOptions}</IonList>
    </IonContent>
  );
};

export default observer(Menu);
