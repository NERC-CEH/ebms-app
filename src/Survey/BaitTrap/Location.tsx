import { useContext } from 'react';
import { observer } from 'mobx-react';
import Main from 'Location/common/MapList';
import {
  device,
  Header,
  useLoader,
  useSample,
  useToast,
  LocationType,
} from '@flumens';
import { IonPage, NavContext, useIonViewWillEnter } from '@ionic/react';
import groups from 'common/models/collections/groups';
import Sample from 'common/models/sample';
import { useUserStatusCheck } from 'common/models/user';
import locations, { byType } from 'models/collections/locations';
import Location, { trapCountAttr } from 'models/location';
import { Data, trapLocationsAttr, trapsAttr } from './config';

const REFRESH_INTERVAL = 30 * 60 * 1000;

// Keep the timestamp across page remounts, but not across app reloads.
let sitesRefreshTimestamp: number | null = null;

const BaitTrapLocation = () => {
  const { goBack } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  const refreshSites = async () => {
    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('common.pleaseWait');

    try {
      await locations.fetchRemote({ type: 'baitTraps' });
      sitesRefreshTimestamp = Date.now();
    } catch (error) {
      toast.error(error as Error);
    }

    loader.hide();
  };

  useIonViewWillEnter(() => {
    if (!device.isOnline) return;

    const shouldSyncWait =
      sitesRefreshTimestamp !== null &&
      Date.now() - sitesRefreshTimestamp < REFRESH_INTERVAL;

    if (shouldSyncWait) return;

    refreshSites();
  });

  const { sample } = useSample<Sample<Data>>();
  if (!sample) return null;

  const alphabeticallyByName = (a: Location, b: Location) =>
    a.data.name.localeCompare(b.data.name);

  const sites = locations.filter(byType(LocationType.BaitTrapSite));
  const userLocations = sites.sort(alphabeticallyByName);

  const group = groups.idMap.get(sample.data.groupId || '');
  const groupLocations = sites
    .filter(location => group?.locationCids.includes(location.cid))
    .sort(alphabeticallyByName);

  const onSelectSite = (location?: Location) => {
    sample.data.locationId = location?.id;
    sample.data[trapsAttr.id] = Number(location?.data[trapCountAttr.id]) || 0;

    sample.data[trapLocationsAttr.id] = sample.data[trapsAttr.id] / 2;
    goBack();
  };

  return (
    <IonPage id="bait-trap-sites">
      <Header title="common.sites" />
      <Main
        userLocations={userLocations}
        onSelectSite={onSelectSite}
        selectedLocationId={sample?.data.locationId}
        groupLocations={groupLocations}
        hasGroup={!!group}
        isFetchingLocations={locations.isSynchronising}
      />
    </IonPage>
  );
};

export default observer(BaitTrapLocation);
