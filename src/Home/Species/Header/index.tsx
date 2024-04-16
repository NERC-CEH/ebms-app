import { useState } from 'react';
import { observer } from 'mobx-react';
import { searchOutline } from 'ionicons/icons';
import { IonHeader, IonToolbar, IonIcon } from '@ionic/react';
import { Button } from 'common/flumens';
import FiltersToolbar from './FiltersToolbar';
import logo from './logo.svg';
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
            <img src={logo} className="m-2 size-8" />

            <div className="app-name w-fit">
              <b>Butterfly</b> Count
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
