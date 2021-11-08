import React, { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import { Page, Main, Header } from '@apps';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';

interface Props {
  sample: typeof Sample;
}
const Taxon: FC<Props> = ({ sample }) => {
  const { goBack } = useContext(NavContext);

  const onSpeciesSelected = async (taxon: any) => {
    const { isRecorded } = taxon;

    const survey = sample.getSurvey();

    if (isRecorded) {
      const selectedTaxon = (occurrence: typeof Occurrence) => {
        return occurrence.attrs.taxon.warehouse_id === taxon.warehouse_id;
      };
      const assignTaxon = (occurrence: typeof Occurrence) => {
        // eslint-disable-next-line no-param-reassign
        occurrence.attrs.count++;
        occurrence.save();
      };

      sample.occurrences.filter(selectedTaxon).map(assignTaxon);

      await sample.save();
      goBack();

      return;
    }

    const newOccurrence = survey.occ.create(Occurrence, taxon);
    sample.occurrences.push(newOccurrence);

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
