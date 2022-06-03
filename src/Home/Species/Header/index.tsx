import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonButton,
  IonTitle,
} from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import FiltersToolbar from './FiltersToolbar';
import logo from './logo.svg';
import './styles.scss';

type Props = {
  onSearch: (e: any) => void;
  toggleFilter: (type: string, value: string) => void;
  filters: any;
  filterOptions: any;
};

const Header: FC<Props> = ({
  onSearch,
  toggleFilter,
  filters,
  filterOptions,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const onSearchStart = () => setIsSearching(true);
  const onSearchEnd = () => setIsSearching(false);

  return (
    <IonHeader id="species-search-header">
      {!isSearching && (
        <IonToolbar className="species-toolbar">
          <IonButtons slot="start">
            {/* mode=md because md isn't flashing when tapped */}
            <IonButton mode="md">
              <IonIcon src={logo} />
            </IonButton>
          </IonButtons>

          <IonTitle size="large" className="app-name">
            <b>Butterfly</b> Count
          </IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={onSearchStart} className="search">
              <IonIcon slot="icon-only" icon={searchOutline} />
            </IonButton>
          </IonButtons>
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
