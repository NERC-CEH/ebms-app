import { FC } from 'react';
import Occurrence from 'models/occurrence';
import { observer } from 'mobx-react';
import { Page, Header } from '@flumens';
import Main from './Main';

interface Props {
  occurrence: Occurrence;
}

const OccurrenceHome: FC<Props> = ({ occurrence }) => {
  return (
    <Page id="moth-survey-edit-occurrence">
      <Header title="Edit Occurrence" />
      <Main occurrence={occurrence} />
    </Page>
  );
};

export default observer(OccurrenceHome);
