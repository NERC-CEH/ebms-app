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
    const survey = sample.getSurvey();

    const newOccurrence = survey.occ.create(Occurrence, taxon);
    sample.occurrences.push(newOccurrence);

    await sample.save();
    goBack();
  };

  return (
    <Page id="moth-survey-taxasearch">
      <Header title="Species" />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          speciesGroups={['moths']}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
