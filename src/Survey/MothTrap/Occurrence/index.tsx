import { observer } from 'mobx-react';
import { Page, Header, useSample } from '@flumens';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import Main from './Main';

const OccurrenceHome = () => {
  const { occurrence } = useSample<Sample, Occurrence>();
  if (!occurrence) return null;

  return (
    <Page id="moth-survey-edit-occurrence">
      <Header title="common.editOccurrence" />
      <Main occurrence={occurrence} />
    </Page>
  );
};

export default observer(OccurrenceHome);
