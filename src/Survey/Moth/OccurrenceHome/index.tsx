import { observer } from 'mobx-react';
import { Page, Header } from '@flumens';
import Occurrence from 'models/occurrence';
import Main from './Main';

interface Props {
  occurrence: Occurrence;
}

const OccurrenceHome = ({ occurrence }: Props) => {
  return (
    <Page id="moth-survey-edit-occurrence">
      <Header title="Edit Occurrence" />
      <Main occurrence={occurrence} />
    </Page>
  );
};

export default observer(OccurrenceHome);
