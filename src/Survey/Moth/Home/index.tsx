/* eslint-disable camelcase */
import React, { FC } from 'react';
import Sample from 'models/sample';
import { observer } from 'mobx-react';
import { Plugins, HapticsImpactStyle } from '@capacitor/core';
import { useRouteMatch } from 'react-router';
import { Page, Header, alert } from '@apps';
import { isPlatform } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Main from './Main';
import './styles.scss';

const { Haptics } = Plugins;

function increaseCount(occ: typeof Occurrence) {
  isPlatform('hybrid') && Haptics.impact({ style: HapticsImpactStyle.Heavy });

  occ.attrs.count++; // eslint-disable-line no-param-reassign
  occ.save();
}

function deleteOccurrence(occ: typeof Occurrence) {
  const { scientific_name } = occ.attrs.taxon;

  alert({
    header: 'Delete',
    message: `Are you sure you want to delete ${scientific_name}?`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Delete',
        cssClass: 'secondary',
        handler: () => {
          occ.destroy();
        },
      },
    ],
  });
}

interface Props {
  sample: typeof Sample;
}

const HomeController: FC<Props> = ({ sample }) => {
  const match = useRouteMatch();
  const isDisabled = sample.isDisabled();

  return (
    <Page id="survey-moth-home">
      <Header title="Moth-trap survey" />
      <Main
        match={match}
        sample={sample}
        increaseCount={increaseCount}
        deleteSpecies={deleteOccurrence}
        isDisabled={isDisabled}
      />
    </Page>
  );
};

export default observer(HomeController);
