import { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence, { Taxon } from 'models/occurrence';
import { NavContext } from '@ionic/react';
import { useRouteMatch } from 'react-router';
import { observer } from 'mobx-react';
import { Page, Main, Header } from '@flumens';
import appModel from 'models/app';
import TaxonSearch from 'Components/TaxonSearch';

type Props = {
  subSample: Sample;
};

const Controller: FC<Props> = ({ subSample: sectionSample }) => {
  const { goBack } = useContext(NavContext);
  const match: any = useRouteMatch();
  const occID = match.params.occId;

  const getTaxonId = (occ: Occurrence) =>
    occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
  const recordedTaxa = sectionSample.occurrences.map(getTaxonId);

  const onSpeciesSelected = async (taxon: Taxon) => {
    if (occID) {
      const byId = (occ: Occurrence) => occ.cid === occID;
      const occurrence = sectionSample.occurrences.find(byId);
      occurrence!.attrs.taxon = taxon;
    } else {
      const survey = sectionSample.getSurvey();
      const occurrence = survey.occ.create(Occurrence, { taxon });
      sectionSample.occurrences.push(occurrence);
    }

    await sectionSample.save();
    goBack();
  };

  return (
    <Page id="transect-sections-taxa">
      <Header title="Species" />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={appModel.attrs.speciesGroups}
        />
      </Main>
    </Page>
  );
};

export default observer(Controller);
