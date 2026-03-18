import { useState } from 'react';
import { observer } from 'mobx-react';
import { searchOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { IonHeader, IonToolbar, IonIcon } from '@ionic/react';
import { Button } from 'common/flumens';
import FiltersToolbar from './FiltersToolbar';
import './styles.scss';

type Props = {
  onSearch: (e: any) => void;
  toggleFilter: (type: string, value: string) => void;
  filters: any;
  filterOptions: any;
};

const Header = ({ onSearch, toggleFilter, filters, filterOptions }: Props) => {
  const [isSearching, setIsSearching] = useState(false);
  const onSearchStart = () => setIsSearching(true);
  const onSearchEnd = () => setIsSearching(false);

  return (
    <IonHeader id="species-search-header">
      {!isSearching && (
        <IonToolbar className="species-toolbar">
          <div className="flex items-center justify-between">
            <div className="text-center font-bold text-2xl ml-8 w-full my-0! text-primary-800">
              <T>Guide</T>
            </div>

            <Button
              onPress={onSearchStart}
              className="p-2"
              fill="clear"
              skipTranslation
            >
              <IonIcon
                icon={searchOutline}
                className="size-8 [--ionicon-stroke-width:20px]"
              />
            </Button>
          </div>
        </IonToolbar>
      )}

      <FiltersToolbar
        options={filterOptions}
        isOpen={isSearching}
        values={filters}
        toggleFilter={toggleFilter}
        onSearch={onSearch}
        onSearchEnd={onSearchEnd}
      />
    </IonHeader>
  );
};

export default observer(Header);
