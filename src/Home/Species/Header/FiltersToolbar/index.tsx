import { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { checkmarkOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { Keyboard } from '@capacitor/keyboard';
import { IonToolbar, IonSearchbar, isPlatform } from '@ionic/react';
import CurrentFilters from './CurrentFilters';
import FiltersMenu, { FilterOption as FilterOptionType } from './FiltersMenu';
import './styles.scss';

export type FilterOption = FilterOptionType;
export type FilterGroup = string;
export type Filter = string;
export type Filters = {
  [key in FilterGroup]?: Filter[];
};

export type FilterGroupWithText = FilterGroup & 'text';

interface Props {
  /**
   * What filters to show.
   */
  options: FilterOption[];
  /**
   * Currently selected filters.
   */
  values: Filters;
  /**
   * On filter select/deselect.
   */
  toggleFilter: any;
  onSearch: any;
  onSearchEnd: any;
  isOpen?: boolean;
}

const FiltersToolbar = ({
  values,
  toggleFilter,
  onSearch: onSearchProp,
  onSearchEnd: onSearchEndProp,
  isOpen,
  options,
}: Props) => {
  const [searchPhrase, setSearchPhrase] = useState('');
  const [tappedSearchEnd, setTappedSearchEnd] = useState(false);
  const searchInput: any = useRef<any>(null);
  const { t } = useTranslation();

  function onSearch(e: any) {
    const { value } = e.detail;

    if (tappedSearchEnd) {
      return;
    }
    setSearchPhrase(value);
    onSearchProp(value);
  }

  const focusSearch = () => {
    if (!isOpen) return;
    setTappedSearchEnd(false);
    searchInput.current.setFocus();
  };
  useEffect(focusSearch, [isOpen, searchInput.current]);

  function onSearchEnd() {
    setTappedSearchEnd(true);
    onSearchEndProp();
    isPlatform('hybrid') && Keyboard.hide();
  }

  function onKeyUp({ keyCode }: { keyCode: number }) {
    if (keyCode === 13) onSearchEnd(); // 13 = Enter
  }

  const selectFilter = (type: FilterGroup, value: Filter) => {
    setSearchPhrase('');
    searchInput.current.setFocus();

    type !== 'text' && toggleFilter(type, value);
  };

  const removeFilter = (type: FilterGroup, value: Filter) => {
    if (type === 'text') {
      setSearchPhrase('');
      onSearchProp('');
      return;
    }

    toggleFilter(type, value);
  };

  return (
    <>
      <IonToolbar className={clsx('species-searchbar', isOpen && 'searching')}>
        <IonSearchbar
          ref={searchInput}
          onIonInput={onSearch}
          slot="end"
          showCancelButton="always"
          cancelButtonText={t('Done')}
          cancelButtonIcon={checkmarkOutline}
          onIonCancel={onSearchEnd}
          type="search"
          enterkeyhint="done"
          onKeyUp={onKeyUp}
          placeholder={t('Species name or filter...')}
          value={searchPhrase}
        />
      </IonToolbar>

      <CurrentFilters
        searchPhrase={searchPhrase}
        values={values}
        onRemove={removeFilter}
      />

      {isOpen && (
        <FiltersMenu
          searchPhrase={searchPhrase}
          values={values}
          onSelect={selectFilter}
          options={options}
        />
      )}
    </>
  );
};

export default FiltersToolbar;
