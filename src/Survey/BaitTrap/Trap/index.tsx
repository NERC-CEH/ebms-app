import { observer } from 'mobx-react';
import { Page, Header, useSample } from '@flumens';
import Sample from 'models/sample';
import { Data, SubSmpData } from '../config';
import Main from './Main';

const TrapHomeController = () => {
  const { sample, subSample } = useSample<
    Sample<Data>,
    any,
    Sample<SubSmpData>
  >();
  if (!sample || !subSample) return null;

  return (
    <Page id="survey-bait-trap-trap-home">
      <Header title="Trap" />
      <Main sample={sample} subSample={subSample} />
    </Page>
  );
};

export default observer(TrapHomeController);
