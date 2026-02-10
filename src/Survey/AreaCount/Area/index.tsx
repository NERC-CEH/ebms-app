import { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import NewSiteModal from 'Location/Site/NewSiteModal';
import { resizeOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { device, useLoader, useSample, useToast } from '@flumens';
import { IonIcon, IonPage, NavContext } from '@ionic/react';
import groups from 'common/models/collections/groups';
import GroupModel from 'common/models/group';
import locations, { byType } from 'models/collections/locations';
import Location, { LocationType } from 'models/location';
import Sample, { AreaCountLocation } from 'models/sample';
import userModel from 'models/user';
import Header from './Header';
import Main from './Main';
import './styles.scss';

const AreaController = () => {
  const { goBack } = useContext(NavContext);
  const loader = useLoader();
  const toast = useToast();

  const { sample } = useSample<Sample>();
  if (!sample) throw new Error('Sample is missing');

  const groupId = sample.data.group?.id;

  const toggleGPStracking = (on: boolean) => {
    sample.toggleGPStracking(on);
  };

  const setLocation = (shape: any) => {
    sample.setLocation(shape);
  };

  const location = (sample.data.location as AreaCountLocation) || {};
  const isGPSTracking = sample.isGPSRunning();
  const { area } = location;

  let infoText;
  if (area) {
    infoText = (
      <div className="text-with-icon-wrapper">
        <IonIcon icon={resizeOutline} />
        <T>Selected area</T>: {area.toLocaleString()} m²
      </div>
    );
  } else {
    infoText = (
      <>
        <T>Please draw your area on the map</T>
        {isGPSTracking && (
          <div>
            <T>Disable the GPS tracking to enable the drawing tools.</T>
          </div>
        )}
      </>
    );
  }

  const { isDisabled } = sample;

  const isAreaShape = location.shape?.type === 'Polygon';

  const modal = useRef<HTMLIonModalElement>(null);
  const onCreateSite = () => modal.current?.present();
  const onSelectSite = (loc?: Location) => {
    if (!sample.data.location) {
      sample.data.location = {} as any; // eslint-disable-line
    }

    const shouldUnselect = !loc || sample.data.site?.id === loc.id;
    if (shouldUnselect) {
      sample.data.site = undefined;
    } else {
      sample.data.site = JSON.parse(JSON.stringify(loc.data));
    }

    sample.save();
    goBack();
  };

  const page = useRef(null);

  const [presentingElement, setPresentingElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    setPresentingElement(page.current);
  }, []);

  const refreshLocations = () => {
    if (
      isDisabled ||
      !userModel.isLoggedIn() ||
      !userModel.data.verified ||
      !device.isOnline
    )
      return;

    locations.fetchRemote();
  };
  useEffect(refreshLocations, []);

  const onSaveNewLocation = async (newLocation: Location) => {
    if (!userModel.isLoggedIn() || !userModel.data.verified || !device.isOnline)
      return false;

    try {
      await loader.show('Please wait...');

      await newLocation.saveRemote();

      if (newLocation.metadata.groupId) {
        const byId = (p: GroupModel) => p.id === newLocation.metadata.groupId;
        const group = groups.find(byId);
        if (!group) throw new Error('Group was not found');

        await group.addRemoteLocation(newLocation.id!);
      }

      await refreshLocations();

      toast.success('Successfully saved a location.');
    } catch (err: any) {
      toast.error(err);
      loader.hide();
      return false;
    }

    loader.hide();
    return true;
  };

  const alphabeticallyByName = (a: Location, b: Location) =>
    a.data.location.name.localeCompare(b.data.location.name);

  const byGroup = (loc: Location) =>
    groupId && loc.metadata.groupId === groupId;
  const groupLocations = locations
    .filter(byType(LocationType.Site))
    .filter(byGroup)
    .sort(alphabeticallyByName);

  const byCreatedByMe = (loc: Location) =>
    loc.data.createdById === `${userModel.data.indiciaUserId}`;
  const userLocations = locations
    .filter(byType(LocationType.Site))
    .filter(byCreatedByMe)
    .sort(alphabeticallyByName);

  return (
    <IonPage id="area" ref={page}>
      <Header
        toggleGPStracking={toggleGPStracking}
        isGPSTracking={isGPSTracking}
        isDisabled={isDisabled}
        infoText={infoText}
        isAreaShape={isAreaShape}
      />
      <Main
        sample={sample}
        isGPSTracking={isGPSTracking}
        setLocation={setLocation}
        isDisabled={isDisabled}
        onCreateSite={onCreateSite}
        onSelectSite={onSelectSite}
        userLocations={userLocations}
        groupLocations={groupLocations}
        isFetchingLocations={locations.isSynchronising}
      />
      <NewSiteModal
        ref={modal}
        presentingElement={presentingElement}
        onSave={onSaveNewLocation}
        group={sample.data.group}
      />
    </IonPage>
  );
};

export default observer(AreaController);
