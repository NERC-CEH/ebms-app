import { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { IonPage, NavContext, useIonViewWillEnter } from '@ionic/react';
import { device, Header, useLoader, useSample, useToast } from 'common/flumens';
import groups from 'common/models/collections/groups';
import Sample from 'common/models/sample';
import userModel, { useUserStatusCheck } from 'common/models/user';
import locations, { byType } from 'models/collections/locations';
import Location, { LocationType } from 'models/location';
import GPSPermissionSubheader from 'Survey/common/GPSPermissionSubheader';
import HeaderButton from 'Survey/common/HeaderButton';
import Main from '../common/MapList';
import NewLocation from './New';

const REFRESH_INTERVAL = 30 * 60 * 1000;

// Keep the timestamp across page remounts, but not across app reloads.
let sitesRefreshTimestamp: number | null = null;

const Site = () => {
  const { goBack } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  const { sample } = useSample<Sample>();

  const group = groups.idMap.get(sample?.data.groupId || '');
  const groupLocations = locations
    .filter(byType(LocationType.MothTrap))
    .filter(location => group?.locationCids.includes(location.cid));
  const userLocations = locations
    .filter(byType(LocationType.MothTrap))
    .filter(
      location =>
        location.data.createdById === `${userModel.data.indiciaUserId}` &&
        !groups.find(project => project.locationCids.includes(location.cid))
    );

  const onSelectSite = (loc?: Location) => {
    sample!.data.locationId = loc?.id;
    sample!.data.enteredSref = `${loc?.data.location.latitude} ${loc?.data.location.longitude}`;
    sample!.save();
    goBack();
  };

  const refreshSites = async () => {
    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    if (!userLocations.length) await loader.show('common.pleaseWait');

    try {
      await locations.fetchRemote({ type: 'mothTraps' });
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

  const modal = useRef<HTMLIonModalElement>(null);

  const onCreateSite = () => {
    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
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

  const onSaveNewLocation = async (location: Location) => {
    if (!userModel.isLoggedIn() || !userModel.data.verified || !device.isOnline)
      return false;

    try {
      await loader.show('common.pleaseWait');

      await location.saveRemote();

      if (location.metadata.groupId) {
        const g = groups.idMap.get(location.metadata.groupId);
        if (!g) throw new Error('Group was not found');

        await g.addRemoteLocation(location.id!);
      }

      await refreshSites();

      toast.success('common.locationSaved');
    } catch (error) {
      toast.error(error as Error);
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
      common.add
    </HeaderButton>
  );

  const gpsPermissionSubheader = !sample?.isDisabled && (
    <GPSPermissionSubheader />
  );

  return (
    <>
      <IonPage id="moth-sites" ref={page}>
        <Header
          title="locations.mothTraps"
          rightSlot={addButton}
          subheader={gpsPermissionSubheader}
        />
        <Main
          userLocations={userLocations}
          groupLocations={groupLocations}
          hasGroup={!!group}
          onSelectSite={sample ? onSelectSite : undefined}
          selectedLocationId={sample?.data.locationId}
          isFetchingLocations={locations.isSynchronising}
        />
      </IonPage>

      <NewLocation
        ref={modal}
        presentingElement={presentingElement}
        onSave={onSaveNewLocation}
        groupId={group?.id}
      />
    </>
  );
};

export default observer(Site);
