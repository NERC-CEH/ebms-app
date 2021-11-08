import React, { FC } from 'react';
import Sample from 'models/sample';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header } from '@apps';
import Main from './Main';
import './styles.scss';

interface Props {
  sample: typeof Sample;
}

const HomeController: FC<Props> = ({ sample }) => {
  const match = useRouteMatch();

  return (
    <Page id="survey-moth-home">
      <Header title="Moth-trap survey" />
      <Main match={match} sample={sample} />
    </Page>
  );
};

export default observer(HomeController);
