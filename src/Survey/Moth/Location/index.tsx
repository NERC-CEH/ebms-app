import React, { FC } from 'react';
import { Page, Header, Main } from '@apps';
import Map from './map';
const Location: FC<Props> = () => {
  return (
    <Page id="moth-survey-location">
      <Header title="Location" />
      <Main>
        <Map />
      </Main>
    </Page>
  );
};

export default Location;
