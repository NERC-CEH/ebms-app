import { useEffect } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Page, useToast, useLoader, device } from '@flumens';
import appModel from 'models/app';
import locations, { byType } from 'models/collections/locations';
import Location, { TRANSECT_SECTION_TYPE } from 'models/location';
import Sample from 'models/sample';
import { useUserStatusCheck } from 'models/user';
import Header from './Header';
import Main from './Main';

type Props = {
  sample: Sample;
};

const TWENTY_FOURTH_HOURS = 24 * 60 * 60 * 1000;

const SectionListController = ({ sample }: Props) => {
  const checkUserStatus = useUserStatusCheck();
  const loader = useLoader();
  const toast = useToast();

  const refreshUserTransects = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('Please wait...');

    try {
      await locations.fetch();

      toast.success('Transect list was successfully updated.');
    } catch (e: any) {
      toast.error(e);
    }
    await loader.hide();
  };

  const onTransectSelect = (transect: Location) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = toJS(transect.attrs);

    const byTransectId = (section: Location) =>
      section.attrs.parentId === transect.id;

    const sections = locations
      .filter(byType(TRANSECT_SECTION_TYPE))
      .filter(byTransectId);

    const survey = sample.getSurvey();
    const addSectionSample = (section: any) => {
      const sectionSample = survey.smp!.create!({
        Sample,
        location: toJS(section.attrs),
      });
      sample.samples.push(sectionSample);
    };

    sections.forEach(addSectionSample);

    sample.save();
  };

  useEffect(() => {
    if (!locations.length && device.isOnline) {
      refreshUserTransects();
      appModel.attrs.transectsRefreshTimestamp = new Date().getTime();
      return;
    }

    const lastSyncTime = appModel.attrs.transectsRefreshTimestamp;
    if (!lastSyncTime) return;

    const shouldSyncWait =
      new Date().getTime() - lastSyncTime < TWENTY_FOURTH_HOURS;

    const isTransectSelected = sample.attrs.location;
    if (shouldSyncWait || isTransectSelected) return;

    refreshUserTransects();
    appModel.attrs.transectsRefreshTimestamp = new Date().getTime();
  }, []);

  const transect = sample.attrs.location;

  return (
    <Page id="transect-sections-list">
      <Header showRefreshButton={!transect} onRefresh={refreshUserTransects} />
      <Main sample={sample} onTransectSelect={onTransectSelect} />
    </Page>
  );
};

export default observer(SectionListController);
