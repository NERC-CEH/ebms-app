import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { searchOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import {
  Page,
  Header,
  Main,
  Button,
  device,
  useToast,
  useLoader,
} from '@flumens';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToolbar,
  IonSearchbar,
  IonIcon,
} from '@ionic/react';
import GPS from 'common/helpers/GPS';
import speciesLists from 'common/models/collections/speciesLists';
import SpeciesList from 'common/models/speciesList';
import AllLists from './components/AllLists';
import InstalledLists from './components/InstalledLists';

const SpeciesListSettings = () => {
  const toast = useToast();
  const loader = useLoader();
  const { t } = useTranslation();
  const searchbarRef = useRef<any>(null);

  const [nearbyLists, setNearbyLists] = useState<SpeciesList[]>([]);
  const [allLists, setAllLists] = useState<SpeciesList[]>([]);
  const [location, setLocation] = useState<{ lat: number; lon: number }>();

  const [segment, setSegment] = useState<'installed' | 'nearby' | 'all'>(
    'installed'
  );

  const onSegmentClick = (e: any) => {
    const newSegment = e.detail.value;
    setSegment(newSegment);
  };

  const [showSearch, setShowSearch] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const onSearch = (e: any) => {
    setCurrentSearch(e.detail.value);
  };

  useEffect(() => {
    const runnerId = GPS.start((err: any, pos: any) => {
      if (err || !pos) {
        GPS.stop(runnerId);
        return;
      }

      setLocation({ lat: pos.latitude, lon: pos.longitude });
    });

    return () => GPS.stop(runnerId);
  }, []);

  const fetchRemoteLists = async () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    await loader.show('Please wait...');

    try {
      const lists = await speciesLists.fetchRemote({ limit: 1000 }); // 1k should cover all lists
      setAllLists(lists);
    } catch (error: any) {
      toast.error(`Failed to load lists: ${error.message}`);
    }

    loader.hide();
  };

  const fetchNearbyLists = async () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    await loader.show('Please wait...');

    try {
      // retrieve lat/lon from device location

      const lists = await speciesLists.fetchRemote({
        limit: 5,
        ...location,
      });
      setNearbyLists(lists);
    } catch (error: any) {
      toast.error(`Failed to load lists: ${error.message}`);
    }

    loader.hide();
  };

  useEffect(() => {
    if (segment === 'nearby') fetchNearbyLists();
    if (segment === 'all') fetchRemoteLists();
  }, [segment]);

  const onInstall = async (list: SpeciesList) => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    await loader.show('Installing list...');

    try {
      speciesLists.push(list);
      await list.save(true);
      await list.fetchRemoteSpecies();

      toast.success(
        `Successfully installed "${list.data.title}" list with ${list.data.size} species`,
        { position: 'bottom' }
      );
    } catch (error: any) {
      toast.error(`Failed to install list: ${error.message}`);
    }

    await loader.hide();

    setCurrentSearch('');
    setShowSearch(false);

    setSegment('installed');
  };

  const searchButton = segment === 'all' && (
    <Button
      fill="clear"
      className="!bg-transparent py-0"
      shape="round"
      onPress={() => {
        setCurrentSearch('');
        setShowSearch(!showSearch);

        if (!showSearch) setTimeout(() => searchbarRef.current.setFocus(), 300); // searchbar is hidden and needs to "unhide" before we can set focus
      }}
    >
      <IonIcon icon={searchOutline} className="size-6" />
    </Button>
  );

  const notInstalled = (list: SpeciesList) =>
    !speciesLists.cidMap.has(list.cid);
  const matchesSearch = (list: SpeciesList) =>
    !currentSearch ||
    list.data.title?.toLowerCase().includes(currentSearch?.toLowerCase()) ||
    list.data.description?.toLowerCase().includes(currentSearch?.toLowerCase());
  const allListsFiltered = allLists.filter(notInstalled).filter(matchesSearch);
  const nearbyListsFiltered = nearbyLists.filter(notInstalled);

  const onReinstall = async (list: SpeciesList) => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    await loader.show('Please wait...');

    try {
      await list.fetchRemoteSpecies();

      toast.success(
        `Successfully refreshed "${list.data.title}" list with ${list.data.size} species`,
        { position: 'bottom' }
      );
    } catch (error: any) {
      toast.error(`Failed to load lists: ${error.message}`);
    }

    loader.hide();
  };

  const onDelete = async (list: SpeciesList) => {
    await speciesLists.remove(list);
    await list.destroy();
  };

  return (
    <Page id="species-list-settings">
      <Header title="Species Lists" rightSlot={searchButton} />

      <Main className="[--padding-bottom:0] [--padding-top:0]">
        <IonToolbar className="fixed text-black [&.ios]:[--background:transparent] [&.md]:shadow-[-1px_2px_7px_0_#0000001a,0_2px_9px_0_#3e396b1a] [&.md]:[--background:white]">
          <div className="flex w-full items-center justify-end gap-2">
            <IonSearchbar
              placeholder={t('List name')}
              className={clsx('!py-0', !showSearch && 'hidden')}
              onIonChange={onSearch}
              ref={searchbarRef}
              value={currentSearch}
              showCancelButton="always"
              onIonCancel={() => {
                setShowSearch(false);
                setCurrentSearch('');
              }}
            />

            {!showSearch && (
              <IonSegment
                onIonChange={onSegmentClick}
                value={segment}
                className="[&.ios]:bg-neutral-200"
              >
                <IonSegmentButton value="installed">
                  <IonLabel className="ion-text-wrap">
                    <T>Installed</T>
                  </IonLabel>
                </IonSegmentButton>

                <IonSegmentButton value="nearby" disabled={!location}>
                  <IonLabel className="ion-text-wrap">
                    <T>Nearby</T>
                  </IonLabel>
                </IonSegmentButton>

                <IonSegmentButton value="all">
                  <IonLabel className="ion-text-wrap">
                    <T>All Lists</T>
                  </IonLabel>
                </IonSegmentButton>
              </IonSegment>
            )}
          </div>
        </IonToolbar>

        {segment === 'installed' && (
          <InstalledLists
            lists={speciesLists as any}
            onDelete={onDelete}
            onReinstall={onReinstall}
          />
        )}
        {segment === 'nearby' && (
          <AllLists
            onInstall={onInstall}
            lists={nearbyListsFiltered}
            onRefresh={fetchNearbyLists}
          />
        )}
        {segment === 'all' && (
          <AllLists
            onInstall={onInstall}
            lists={allListsFiltered}
            onRefresh={fetchRemoteLists}
          />
        )}
      </Main>
    </Page>
  );
};

export default observer(SpeciesListSettings);
