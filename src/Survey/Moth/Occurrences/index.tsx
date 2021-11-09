/* eslint-disable camelcase */
import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, alert } from '@apps';
import Sample from 'models/sample';
import Main from './Main';
import './styles.scss';

interface Props {
  sample: typeof Sample;
}

const Occurrences: FC<Props> = ({ sample }) => {
  const match = useRouteMatch();

  const deleteSpecies = (occurrence: typeof Sample) => {
    alert({
      header: 'Delete',
      message: 'Are you sure you want to delete this species?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'primary',
        },
        {
          text: 'Delete',
          cssClass: 'secondary',
          handler: () => occurrence.destroy(),
        },
      ],
    });
  };

  return (
    <Page id="survey-moth-occurrences">
      <Header title="Occurrences" />
      <Main match={match} sample={sample} deleteSpecies={deleteSpecies} />
    </Page>
  );
};

export default observer(Occurrences);
