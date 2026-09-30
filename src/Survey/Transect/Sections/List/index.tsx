import { observer } from 'mobx-react';
import { Page, Header, useSample } from '@flumens';
import Sample from 'models/sample';
import Main from './Main';

const SectionListController = () => {
  const { sample } = useSample<Sample>();
  if (!sample) throw new Error('Sample is missing');

  return (
    <Page id="transect-sections-list">
      <Header title="transect.sections" defaultHref="/home/user-surveys" />
      <Main sample={sample} />
    </Page>
  );
};

export default observer(SectionListController);
