import { FC, useEffect } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import appModel from 'models/app';
import userModel, { useUserStatusCheck } from 'models/user';
import { Page, useToast, useLoader, device } from '@flumens';
import Header from './Header';
import Main from './Main';

type Props = {
  sample: Sample;
};

const SectionListController: FC<Props> = ({ sample }) => {
  const checkUserStatus = useUserStatusCheck();
  const loader = useLoader();
  const toast = useToast();

  const refreshUserTransects = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    await loader.show('Please wait...');

    try {
      await appModel.updateUserTransects(userModel);

      toast.success('Transect list was successfully updated.');
    } catch (e: any) {
      toast.error(e);
    }
    await loader.hide();
  };

  const addSectionSubSamples = () => {
    const transect = sample.attrs.location;
    const survey = sample.getSurvey();
    const addSection = (section: any) => {
      const sectionSample = survey.smp.create(Sample, section);
      sample.samples.push(sectionSample);
    };
    transect.sections.forEach(addSection);
    sample.save();
  };

  const onTransectSelect = (transect: any) => {
    const location = toJS(transect);
    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = location;
    addSectionSubSamples();
  };

  useEffect(() => {
    if (!appModel.attrs.transects.length && device.isOnline) {
      refreshUserTransects();
    }
  }, []);

  const transect = sample.attrs.location;

  return (
    <Page id="transect-sections-list">
      <Header
        showRefreshButton={!transect}
        // eslint-disable-next-line @getify/proper-arrows/name
        onRefresh={() => refreshUserTransects()}
      />
      <Main
        sample={sample}
        appModel={appModel}
        onTransectSelect={onTransectSelect}
      />
    </Page>
  );
};

export default observer(SectionListController);
