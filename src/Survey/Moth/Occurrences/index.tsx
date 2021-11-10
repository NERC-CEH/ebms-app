/* eslint-disable camelcase */
import React, { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, alert } from '@apps';
import { NavContext } from '@ionic/react';
import Sample from 'models/sample';
import Main from './Main';
import './styles.scss';

function deleteSamplePrompt(occ: any) {
  alert({
    header: 'Delete',
    message: 'Are you sure you want to delete this occurrence?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Delete',
        cssClass: 'secondary',
        handler: occ,
      },
    ],
  });
}

interface Props {
  sample: typeof Sample;
}

const Occurrences: FC<Props> = ({ sample }) => {
  const match = useRouteMatch();
  const { taxa }: any = match.params;

  const { goBack } = useContext(NavContext);

  const deleteSpecies = (occ: any) => {
    const deleteSample = async () => {
      await occ.destroy();

      const selectedTaxon = (occurrence: any) => {
        return occurrence.attrs.taxon.warehouse_id === parseInt(taxa, 10);
      };

      const lastOcc = sample.occurrences.find(selectedTaxon);

      if (!lastOcc) {
        goBack();
      }
    };

    deleteSamplePrompt(deleteSample);
  };

  return (
    <Page id="survey-moth-occurrences">
      <Header title="Occurrences" />
      <Main match={match} sample={sample} deleteSpecies={deleteSpecies} />
    </Page>
  );
};

export default observer(Occurrences);
