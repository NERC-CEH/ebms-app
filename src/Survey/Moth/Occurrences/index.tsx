/* eslint-disable camelcase */
import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header } from '@apps';
import Sample from 'models/sample';
import Main from './Main';
import './styles.scss';

interface Props {
  sample: typeof Sample;
}

const Occurrences: FC<Props> = ({ sample }) => {
  const match = useRouteMatch();

  return (
    <Page id="survey-moth-occurrences">
      <Header title="Occurrences" />
      <Main match={match} sample={sample} />
    </Page>
  );
};

export default observer(Occurrences);
