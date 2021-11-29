import React, { FC, useEffect, useState } from 'react';
import { Page, Header, Main } from '@apps';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import userModel from 'models/userModel';
import Map from './Components/Map';
import './styles.scss';

interface Props {
  sample: typeof Sample;
}

const Location: FC<Props> = ({ sample }) => {
  const [isFetchingTraps, setFetchingTraps] = useState<boolean | null>(null);

  const refreshMothTrapsWrap = () => {
    async function refreshMothTraps() {
      try {
        setFetchingTraps(true);
        await userModel.refreshMothTraps();
      } finally {
        setFetchingTraps(false);
      }
    }
    refreshMothTraps();
  };
  useEffect(refreshMothTrapsWrap, []);

  return (
    <Page id="moth-survey-location">
      <Header title="Moth traps" />
      <Main>
        <Map
          sample={sample}
          userModel={userModel}
          isFetchingTraps={isFetchingTraps}
        />
      </Main>
    </Page>
  );
};

export default observer(Location);
