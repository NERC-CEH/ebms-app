import { FC } from 'react';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { Page, Header } from '@flumens';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
  subSample: Sample;
  occurrence: Occurrence;
};

const Container: FC<Props> = ({ sample, subSample, occurrence }) => {
  const isDisabled = !!sample.metadata.synced_on;

  return (
    <Page id="precise-area-count-edit-occurrence">
      <Header title="Edit Occurrence" />
      <Main
        occurrence={occurrence}
        subSample={subSample}
        isDisabled={isDisabled}
      />
    </Page>
  );
};

export default observer(Container);