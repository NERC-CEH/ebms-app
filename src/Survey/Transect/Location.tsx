import { useContext } from 'react';
import { observer } from 'mobx-react';
import Main from 'Location/common/MapList';
import { Page, Header, useToast, useLoader, device, useSample } from '@flumens';
import { NavContext, useIonViewWillEnter } from '@ionic/react';
import groups from 'models/collections/groups';
import locations, { byType } from 'models/collections/locations';
import Location, { LocationType } from 'models/location';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';

const REFRESH_INTERVAL = 30 * 60 * 1000;

// Keep the timestamp across page remounts, but not across app reloads.
let transectsRefreshTimestamp: number | null = null;

const TransectLocation = () => {
  const { goBack } = useContext(NavContext);
  const checkUserStatus = useUserStatusCheck();
  const loader = useLoader();
  const toast = useToast();

  const { sample } = useSample<Sample>();
  if (!sample) throw new Error('Sample is missing');

  const refreshUserTransects = async () => {
    if (!device.isOnline) {
      toast.warn('common.sorryLooksLike');
      return;
    }

    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('common.pleaseWait');

    try {
      await locations.fetchRemote({ type: 'transects' });
      transectsRefreshTimestamp = Date.now();

      toast.success('transect.transectListWas');
    } catch (error) {
      toast.error(error as Error);
    }
    await loader.hide();
  };

  const onTransectSelect = (transect?: Location) => {
    // Preserve the existing selection lock to protect section observations.
    if (sample.isDisabled || sample.data.locationId) return;

    if (!transect) {
      goBack();
      return;
    }

    sample.data.locationId = transect.id;
    sample.data.enteredSref = transect.data.centroidSref;
    sample.data.enteredSrefSystem = transect.data
      .centroidSrefSystem as Sample['data']['enteredSrefSystem'];

    const byTransectId = (section: Location) =>
      section.data.parentId === transect.id;

    const byCode = (loc1: Location, loc2: Location) => {
      const sectionCodeNumberIndex1 = Number(
        loc1.data.code?.match(/\d+$/)?.[0]
      );
      const sectionCodeNumberIndex2 = Number(
        loc2.data.code?.match(/\d+$/)?.[0]
      );
      return sectionCodeNumberIndex1 - sectionCodeNumberIndex2;
    };

    const sections = locations
      .filter(byType(LocationType.TransectSection))
      .filter(byTransectId)
      .sort(byCode);

    const survey = sample.getSurvey();
    const addSectionSample = (section: Location) => {
      const sectionSample = survey.smp!.create!({ location: section });
      sample.samples.push(sectionSample);
    };

    sections.forEach(addSectionSample);

    sample.save();
    goBack();
  };

  useIonViewWillEnter(() => {
    if (!device.isOnline) return;

    const shouldSyncWait =
      transectsRefreshTimestamp !== null &&
      Date.now() - transectsRefreshTimestamp < REFRESH_INTERVAL;

    if (shouldSyncWait) return;

    refreshUserTransects();
  });

  const alphabeticallyByName = (a: Location, b: Location) =>
    a.data.name.localeCompare(b.data.name);

  const userLocations = locations
    .filter(byType(LocationType.Transect))
    .sort(alphabeticallyByName);

  const group = groups.idMap.get(sample.data.groupId || '');
  const groupLocations = userLocations.filter(location =>
    group?.locationCids.includes(location.cid)
  );

  return (
    <Page id="transect-location">
      <Header title="transect.transects" />
      <Main
        userLocations={userLocations}
        onSelectSite={onTransectSelect}
        selectedLocationId={sample.data.locationId}
        groupLocations={groupLocations}
        hasGroup={!!group}
        isFetchingLocations={locations.isSynchronising}
      />
    </Page>
  );
};

export default observer(TransectLocation);
