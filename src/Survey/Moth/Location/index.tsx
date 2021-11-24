import React, { FC } from 'react';
import { Page, Header, Main } from '@apps';
import Sample from 'models/sample';
import Map from './Components/Map';

interface Props {
  sample: typeof Sample;
}

const Location: FC<Props> = ({ sample }) => {
  return (
    <Page id="moth-survey-location">
      <Header title="Location" />
      <Main>
        <Map sample={sample} />
      </Main>
    </Page>
  );
};

export default Location;
