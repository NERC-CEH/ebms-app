import { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import Main from 'Location/Site/List/Main';
import {
  device,
  Header,
  useLoader,
  useSample,
  useToast,
  LocationType,
} from '@flumens';
import { IonPage, NavContext } from '@ionic/react';
import Sample from 'common/models/sample';
import { useUserStatusCheck } from 'common/models/user';
import locations, { byType } from 'models/collections/locations';
import Location, { trapCountAttr } from 'models/location';
import { Data, trapsAttr } from './config';

const BaitTrapLocation = () => {
  const { goBack } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  const refreshSites = async () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('Please wait...');

    try {
      await locations.fetchRemote({ type: 'baitTraps' });
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  useEffect(() => {
    refreshSites();
  }, []);

  const { sample } = useSample<Sample<Data>>();
  if (!sample) return null;

  const alphabeticallyByName = (a: Location, b: Location) =>
    a.data.name.localeCompare(b.data.name);

  const userLocations = locations
    .filter(byType(LocationType.BaitTrapSite))
    .sort(alphabeticallyByName);

  const onSelectSite = (location?: Location) => {
    sample.data.locationId = location?.id;
    sample.data[trapsAttr.id] =
      Number(location?.data[trapCountAttr.id].value) || 0;
    goBack();
  };

  return (
    <IonPage id="bait-trap-sites">
      <Header title="Sites" />
      <Main
        userLocations={userLocations}
        onSelectSite={onSelectSite}
        selectedLocationId={sample?.data.locationId}
        hasGroup={false}
        isFetchingLocations={locations.isSynchronising}
      />
    </IonPage>
  );
};

export default observer(BaitTrapLocation);
