import { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import { observer } from 'mobx-react';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import { useRouteMatch } from 'react-router';
import { Page, Main, Header, useAlert } from '@flumens';
import { Trans as T } from 'react-i18next';
import TaxonSearchFilters from 'Survey/common/TaxonSearchFilters';

async function showMergeSpeciesAlert(alert: any) {
  const showMergeSpeciesDialog = (resolve: any) => {
    alert({
      header: 'Species already exists',
      message: (
        <T>
          Are you sure you want to merge this list to the existing species list?
        </T>
      ),
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

type Props = {
  sample: Sample;
  occurrence: Occurrence;
};

const TaxonController: FC<Props> = ({ sample, occurrence }) => {
  const { goBack } = useContext(NavContext);
  const match = useRouteMatch();
  const alert = useAlert();

  const onSpeciesSelected = async (taxon: any) => {
    const { taxa }: any = match.params;
    const { isRecorded } = taxon;

    if (taxa && isRecorded) {
      const mergeSpecies = await showMergeSpeciesAlert(alert);

      if (!mergeSpecies) {
        return;
      }
    }

    if (taxa) {
      const selectedTaxon = ({ occurrences }: Sample) => {
        const [occ] = occurrences; // always one
        return occ.attrs.taxon.warehouse_id === parseInt(taxa, 10);
      };
      const assignTaxon = ({ occurrences }: Sample) => {
        const [occ] = occurrences; // always one
        occ.attrs.taxon = taxon;
      };
      sample.samples.filter(selectedTaxon).forEach(assignTaxon);

      await sample.save();

      goBack();

      return;
    }

    if (occurrence) {
      // eslint-disable-next-line
      occurrence.attrs.taxon = taxon;
    } else {
      const survey = sample.getSurvey();
      const zeroAbundance = sample.isSurveyPreciseSingleSpecies() ? 't' : null;

      const newSample = survey.smp.create(
        Sample,
        Occurrence,
        taxon,
        zeroAbundance
      );
      sample.samples.push(newSample);

      if (!sample.isSurveyPreciseSingleSpecies()) {
        newSample.startGPS();
      }
    }

    await sample.save();
    goBack();
  };

  const getTaxonId = (smp: Sample) => {
    const occ = smp.occurrences[0];
    return occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
  };
  const species = sample.samples.map(getTaxonId);

  const getShallowTaxonId = (taxon: any) =>
    taxon.preferredId || taxon.warehouse_id;
  const shallowSpecies = sample.shallowSpeciesList.map(getShallowTaxonId);

  const recordedTaxa = [...species, ...shallowSpecies];

  return (
    <Page id="precise-area-count-edit-taxa">
      <Header
        title="Species"
        rightSlot={<TaxonSearchFilters sample={sample} />}
      />
      <Main>
        <TaxonSearch
          onSpeciesSelected={onSpeciesSelected}
          recordedTaxa={recordedTaxa}
          speciesGroups={sample.metadata.speciesGroups}
          useDayFlyingMothsOnly={sample.metadata.useDayFlyingMothsOnly}
        />
      </Main>
    </Page>
  );
};

export default observer(TaxonController);
