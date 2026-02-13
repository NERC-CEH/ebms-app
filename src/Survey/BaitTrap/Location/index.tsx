import { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import Main from 'Location/Site/List/Main';
import NewSiteModal from 'Location/Site/NewSiteModal';
import {
  device,
  Header,
  useLoader,
  useSample,
  useToast,
  LocationType,
} from '@flumens';
import { IonPage, NavContext } from '@ionic/react';
import groups from 'common/models/collections/groups';
import Group from 'common/models/group';
import Sample from 'common/models/sample';
import userModel, { useUserStatusCheck } from 'common/models/user';
import locations, { byType } from 'models/collections/locations';
import Location from 'models/location';
import HeaderButton from 'Survey/common/HeaderButton';
import { Data } from '../config';

const BaitTrapLocation = () => {
  const { goBack } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const checkUserStatus = useUserStatusCheck();

  const { sample } = useSample<Sample<Data>>();

  const alphabeticallyByName = (a: Location, b: Location) =>
    a.data.location.name.localeCompare(b.data.location.name);

  const byCreatedByMe = (location: Location) =>
    location.data.createdById === `${userModel.data.indiciaUserId}`;
  const userLocations = locations
    .filter(byType(LocationType.BaitTrapSite))
    .filter(byCreatedByMe)
    .sort(alphabeticallyByName);

  const onSelectSite = (loc?: Location) => {
    const shouldUnselect = !loc || sample!.data.location?.id === loc.id;

    if (shouldUnselect) {
      sample!.data.location = undefined;
    } else {
      sample!.data.location = JSON.parse(JSON.stringify(loc.data));
    }

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

    await loader.show('Please wait...');

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

  const onSaveNewLocation = async (newLocation: Location) => {
    if (!userModel.isLoggedIn() || !userModel.data.verified || !device.isOnline)
      return false;

    try {
      await loader.show('Please wait...');

      await newLocation.saveRemote();

      if (newLocation.metadata.groupId) {
        const byId = (p: Group) => p.id === newLocation.metadata.groupId;
        const group = groups.find(byId);

        if (!group) throw new Error('Group was not found');

        await group.addRemoteLocation(newLocation.id!);
      }

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
      isInvalid={!device.isOnline}
      className="text-sm"
    >
      Add
    </HeaderButton>
  );

  return (
    <>
      <IonPage id="bait-trap-sites" ref={page}>
        <Header title="Sites" rightSlot={addButton} />
        <Main
          groupLocations={[]}
          userLocations={userLocations}
          onSelectSite={sample ? onSelectSite : undefined}
          selectedLocationId={sample?.data.location?.id}
          hasGroup={false}
          isFetchingLocations={locations.isSynchronising}
        />
      </IonPage>

      <NewSiteModal
        ref={modal}
        presentingElement={presentingElement}
        onSave={onSaveNewLocation}
      />
    </>
  );
};

export default observer(BaitTrapLocation);
