import React, { FC, useContext } from 'react';
import { useRouteMatch } from 'react-router';
import { observer } from 'mobx-react';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import { Page, Main, Header, alert } from '@apps';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';

async function showMergeSpeciesAlert() {
  const showMergeSpeciesDialog = (resolve: any) => {
    alert({
      header: 'Species already exists',
      message:
        'Are you sure you want to merge this list to the existing species list?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            resolve(false);
          },
        },
        {
          text: 'Merge',
          cssClass: 'primary',
          handler: () => {
            resolve(true);
          },
        },
      ],
    });
  };
  return new Promise(showMergeSpeciesDialog);
}

interface Props {
  sample: typeof Sample;
  occurrence: typeof Occurrence;
  match: any;
}
const Taxon: FC<Props> = ({ sample, occurrence }) => {
  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch();
  const { taxa }: any = match.params;

  const onSpeciesSelected = async (taxon: any) => {
    const { isRecorded } = taxon;

    const survey = sample.getSurvey();
    if (taxa && isRecorded) {
      const mergeSpecies = await showMergeSpeciesAlert();

      if (!mergeSpecies) {
        return;
      }
    }

    if (taxa) {
      const selectedTaxon = (occ: typeof Occurrence) => {
        return occ.attrs.taxon.warehouse_id === parseInt(taxa, 10);
      };

      const assignTaxon = (occ: typeof Occurrence) => {
        // eslint-disable-next-line no-param-reassign
        occ.attrs.taxon = taxon;
        occ.save();
      };

      sample.occurrences.filter(selectedTaxon).forEach(assignTaxon);

      await sample.save();

      navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence) {
      // eslint-disable-next-line no-param-reassign
      occurrence.attrs.taxon = taxon;
      occurrence.save();
    } else {
      const identifier = sample.attrs.recorder;

      const newOccurrence = survey.occ.create(Occurrence, taxon, identifier);
      sample.occurrences.push(newOccurrence);
    }
    await sample.save();
    goBack();
  };

  const getTaxonId = (occ: typeof Occurrence) => {
    return occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
  };
  const species = sample.occurrences.map(getTaxonId);

  const recordedTaxa = [...species];

  return (
    <Page id="moth-survey-taxasearch">
      <Header title="Species" />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={['moths']}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
