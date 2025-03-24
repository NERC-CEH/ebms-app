import { useEffect } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Page, useToast, useLoader, device, useSample } from '@flumens';
import appModel from 'models/app';
import locations, { byType } from 'models/collections/locations';
import Location, { LocationType } from 'models/location';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import Header from './Header';
import Main from './Main';

const TWENTY_FOURTH_HOURS = 24 * 60 * 60 * 1000;

const SectionListController = () => {
  const checkUserStatus = useUserStatusCheck();
  const loader = useLoader();
  const toast = useToast();

  const { sample } = useSample<Sample>();
  if (!sample) throw new Error('Sample is missing');

  const refreshUserTransects = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('Please wait...');

    try {
      await locations.fetchRemote();

      toast.success('Transect list was successfully updated.');
    } catch (e: any) {
      toast.error(e);
    }
    await loader.hide();
  };

  const onTransectSelect = (transect: Location) => {
    // eslint-disable-next-line no-param-reassign
    sample.data.location = toJS(transect.data);

    const byTransectId = (section: Location) =>
      section.data.parentId === transect.id;

    const byCode = (loc1: Location, loc2: Location) => {
      const sectionCodeNumberIndex1: any = loc1.data.code?.match(/\d+$/)?.[0];
      const sectionCodeNumberIndex2: any = loc2.data.code?.match(/\d+$/)?.[0];
      return sectionCodeNumberIndex1 - sectionCodeNumberIndex2;
    };

    const sections = locations
      .filter(byType(LocationType.TransectSection))
      .filter(byTransectId)
      .sort(byCode);

    const survey = sample.getSurvey();
    const addSectionSample = (section: any) => {
      const sectionSample = survey.smp!.create!({
        Sample,
        location: toJS(section.data),
      });
      sample.samples.push(sectionSample);
    };

    sections.forEach(addSectionSample);

    sample.save();
  };

  useEffect(() => {
    if (!locations.length && device.isOnline) {
      refreshUserTransects();
      appModel.data.transectsRefreshTimestamp = new Date().getTime();
      return;
    }

    const lastSyncTime = appModel.data.transectsRefreshTimestamp;
    if (!lastSyncTime) return;

    const shouldSyncWait =
      new Date().getTime() - lastSyncTime < TWENTY_FOURTH_HOURS;

    const isTransectSelected = sample.data.location;
    if (shouldSyncWait || isTransectSelected) return;

    refreshUserTransects();
    appModel.data.transectsRefreshTimestamp = new Date().getTime();
  }, []);

  const transect = sample.data.location;

  return (
    <Page id="transect-sections-list">
      <Header showRefreshButton={!transect} onRefresh={refreshUserTransects} />
      <Main sample={sample} onTransectSelect={onTransectSelect} />
    </Page>
  );
};

export default observer(SectionListController);
