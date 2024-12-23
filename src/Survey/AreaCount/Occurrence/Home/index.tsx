import { observer } from 'mobx-react';
import { Page, Header } from '@flumens';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
  subSample: Sample;
  occurrence: Occurrence;
};

const Container = ({ sample, subSample, occurrence }: Props) => (
  <Page id="precise-area-count-edit-occurrence">
    <Header title="Edit Occurrence" />
    <Main
      occurrence={occurrence}
      subSample={subSample}
      isDisabled={sample.isDisabled()}
    />
  </Page>
);

export default observer(Container);
