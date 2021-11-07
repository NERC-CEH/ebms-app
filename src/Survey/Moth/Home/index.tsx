import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header } from '@apps';
import Main from './Main';

const HomeController: FC = () => {
  const match = useRouteMatch();

  return (
    <Page id="survey-moth-home">
      <Header title="Moth-trap survey" />
      <Main match={match} />
    </Page>
  );
};

export default observer(HomeController);
