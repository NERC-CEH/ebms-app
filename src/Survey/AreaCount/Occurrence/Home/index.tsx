import { observer } from 'mobx-react';
import { Page, Header, useSample } from '@flumens';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import Main from './Main';
import './styles.scss';

const Container = () => {
  const { sample, subSample, occurrence } = useSample<Sample, Occurrence>();

  return (
    <Page id="precise-area-count-edit-occurrence">
      <Header title="Edit Occurrence" />
      <Main
        occurrence={occurrence!}
        subSample={subSample!}
        isDisabled={sample!.isDisabled}
      />
    </Page>
  );
};
export default observer(Container);
