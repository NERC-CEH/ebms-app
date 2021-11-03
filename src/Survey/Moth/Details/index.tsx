import React, { FC } from 'react';
import Sample from 'models/sample';
import { observer } from 'mobx-react';
import { Page, Header } from '@apps';
import Main from './Main';

type Props = {
  sample: typeof Sample;
};

const DetailsController: FC<Props> = ({ sample }) => {
  return (
    <Page id="survey-moth-detail">
      <Header title="Survey Details" />
      <Main sample={sample} />
    </Page>
  );
};

export default observer(DetailsController);
