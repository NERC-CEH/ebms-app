import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Main, Header, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import groups from 'common/data/groups';
import Occurrence, { Taxon as TaxonType } from 'models/occurrence';
import Sample from 'models/sample';
import TaxonSearch from 'Survey/common/TaxonSearch';
import { Data } from './config';

const Taxon = () => {
  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch<any>();

  const { subSample, occurrence } = useSample<Sample<Data>, Occurrence>();
  if (!subSample) return null;

  const onSpeciesSelected = async (taxon: TaxonType) => {
    if (occurrence) {
      // editing existing occurrence
      occurrence.data.taxon = taxon;
      occurrence.save();
      goBack();
      return;
    }

    // adding new occurrence
    const survey = subSample.getSurvey();
    const newOcc = survey.occ!.create!({ Occurrence, taxon });
    subSample.occurrences.push(newOcc);
    subSample.save();

    const baseURL = match.url.replace('/taxon', '');
    navigate(`${baseURL}/occ/${newOcc.cid}`, 'forward', 'replace');
  };

  const getTaxonId = (occ: Occurrence) =>
    occ.data.taxon?.preferredId || occ.data.taxon?.warehouseId;

  const recordedTaxa = subSample.occurrences.map(getTaxonId);

  return (
    <Page id="bait-trap-survey-taxasearch">
      <Header title="Species" />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={[groups.butterflies.id]}
        />
      </Main>
    </Page>
  );
};

export default observer(Taxon);
