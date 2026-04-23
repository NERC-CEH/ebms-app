import { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { IonPage, NavContext } from '@ionic/react';
import { device, Header, useLoader, useSample, useToast } from 'common/flumens';
import Sample from 'common/models/sample';
import userModel, { useUserStatusCheck } from 'common/models/user';
import locations, { byType } from 'models/collections/locations';
import Location, {
  LocationType,
  type Data as LocationData,
} from 'models/location';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import HeaderButton from 'Survey/common/HeaderButton';
import Main from '../common/MapList';
import NewLocation from './New';

const Site = () => {
  const { goBack } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  const { sample } = useSample<Sample>();

  const userLocations = locations.filter(byType(LocationType.MothTrap));

  const onSelectSite = (loc?: Location) => {
    sample!.data.locationId = loc?.id;
    sample!.data.enteredSref = `${loc?.data.location.latitude} ${loc?.data.location.longitude}`;
    sample!.save();
    goBack();
  };

  const refreshSites = async () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    if (!userLocations.length) await loader.show('Please wait...');

    try {
      await locations.fetchRemote();
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  useEffect(() => {
    refreshSites();
  }, []);

  const modal = useRef<HTMLIonModalElement>(null);

  const onCreateSite = () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }
    modal.current?.present();
  };

  const page = useRef(null);

  const [presentingElement, setPresentingElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    setPresentingElement(page.current);
  }, []);

  const onSaveNewLocation = async (data: Partial<LocationData>) => {
    if (!userModel.isLoggedIn() || !userModel.data.verified || !device.isOnline)
      return false;

    try {
      await loader.show('Please wait...');

      const location = new Location({ skipStore: true, data: data as any });
      await location.saveRemote();

      await refreshSites();

      toast.success('Successfully saved a location.');
    } catch (err: any) {
      toast.error(err);
      loader.hide();
      return false;
    }

    loader.hide();
    return true;
  };

  const addButton = (
    <HeaderButton
      onClick={onCreateSite}
      isInvalid={!device.isOnline && !locations.isSynchronising}
      className="text-sm"
    >
      Add
    </HeaderButton>
  );

  const gpsPermissionSubheader = !sample?.isDisabled && (
    <GPSPermissionSubheader />
  );

  return (
    <>
      <IonPage id="moth-sites" ref={page}>
        <Header
          title="Moth traps"
          rightSlot={addButton}
          subheader={gpsPermissionSubheader}
        />
        <Main
          userLocations={userLocations}
          onSelectSite={sample ? onSelectSite : undefined}
          selectedLocationId={sample?.data.locationId}
          isFetchingLocations={locations.isSynchronising}
        />
      </IonPage>

      <NewLocation
        ref={modal}
        presentingElement={presentingElement}
        onSave={onSaveNewLocation}
      />
    </>
  );
};

export default observer(Site);
