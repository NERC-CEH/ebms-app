import { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence, { Taxon } from 'models/occurrence';
import { NavContext } from '@ionic/react';
import { useRouteMatch } from 'react-router';
import { observer } from 'mobx-react';
import { Page, Main, Header } from '@flumens';
import TaxonSearch from 'Components/TaxonSearch';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';
import showMergeSpeciesAlert from 'Survey/common/showMergeSpeciesAlert';

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
      <Header
        title="Species"
        rightSlot={<TaxonSearchFilters sample={sectionSample.parent} />}
      />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={sectionSample?.parent.metadata.speciesGroups}
          useDayFlyingMothsOnly={
            sectionSample?.parent.metadata.useDayFlyingMothsOnly
          }
        />
      </Main>
    </Page>
  );
};

export default observer(Controller);
