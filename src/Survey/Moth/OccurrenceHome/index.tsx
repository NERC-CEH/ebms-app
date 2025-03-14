import { observer } from 'mobx-react';
import { Page, Header, useSample } from '@flumens';
import Occurrence from 'models/occurrence';
import Main from './Main';

const OccurrenceHome = () => {
  const { occurrence } = useSample<any, Occurrence>();
  if (!occurrence) return null;

  return (
    <Page id="moth-survey-edit-occurrence">
      <Header title="Edit Occurrence" />
      <Main occurrence={occurrence} />
    </Page>
  );
};

export default observer(OccurrenceHome);
