/* eslint-disable no-param-reassign */
import React, { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import { Page, Main, Header, alert } from '@apps';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import { UNKNOWN_SPECIES } from 'Survey/Moth/config';

type resolveType = (value: boolean) => void;

async function showMergeSpeciesAlert() {
  const showMergeSpeciesDialog = (resolve: resolveType) => {
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

  return new Promise<boolean>(showMergeSpeciesDialog);
}

interface Props {
  sample: typeof Sample;
  occurrence: typeof Occurrence;
}

const Taxon: FC<Props> = ({ sample, occurrence }) => {
  const { navigate, goBack } = useContext(NavContext);

  const onSpeciesSelected = async (taxon: any) => {
    const { isRecorded } = taxon;
    const survey = sample.getSurvey();

    const isTaxonUnknown =
      taxon.warehouse_id === UNKNOWN_SPECIES.preferred_taxa_taxon_list_id;
    if (occurrence && isTaxonUnknown) {
      occurrence.attrs.taxon = taxon;
      occurrence.save();
      navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence && isRecorded && !isTaxonUnknown) {
      const selectedTaxon = (selectedOccurrence: typeof Occurrence) => {
        return (
          occurrence.attrs.taxon?.warehouse_id &&
          selectedOccurrence !== occurrence &&
          selectedOccurrence.attrs.comment === occurrence?.attrs?.comment &&
          selectedOccurrence.attrs.identifier === occurrence?.attrs?.identifier
        );
      };

      const occWithSameSpecies = sample.occurrences.find(selectedTaxon);

      if (!occWithSameSpecies) {
        occurrence.attrs.taxon = taxon;
        occurrence.save();
        navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
        return;
      }

      const isSelectedSameSpecies =
        taxon.warehouse_id === occurrence.attrs.taxon.warehouse_id;
      if (isSelectedSameSpecies) {
        navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
        return;
      }

      const mergeSpecies = await showMergeSpeciesAlert();

      if (!mergeSpecies) return;

      occWithSameSpecies.attrs.count += occurrence.attrs.count;
      occWithSameSpecies.attrs['count-outside'] +=
        occurrence.attrs['count-outside'];

      while (occurrence.media.length) {
        const copy = occurrence.media.pop();
        occWithSameSpecies.media.push(copy);
      }
      occWithSameSpecies.save();

      occurrence.destroy();

      navigate(`/survey/moth/${sample.cid}`, 'none', 'pop');
      return;
    }

    if (occurrence && !isTaxonUnknown) {
      occurrence.attrs.taxon = taxon;
      occurrence.save();

      goBack();
      return;
    }

    const selectedTaxon = (selectedOccurrence: typeof Occurrence) => {
      return (
        selectedOccurrence.attrs.taxon?.warehouse_id === taxon?.warehouse_id
      );
    };
    const occ = sample.occurrences.find(selectedTaxon);

    if (isTaxonUnknown) {
      const identifier = sample.attrs.recorder;
      const newOccurrence = survey.occ.create(Occurrence, taxon, identifier);
      sample.occurrences.push(newOccurrence);

      await sample.save();
      goBack();
      return;
    }

    if (!occ) {
      const identifier = sample.attrs.recorder;
      const newOccurrence = survey.occ.create(Occurrence, taxon, identifier);
      sample.occurrences.push(newOccurrence);

      await sample.save();
      goBack();
      return;
    }

    occ.attrs.count += 1;
    occ.save();

    await sample.save();
    goBack();
  };

  const getTaxonId = (occ: typeof Occurrence) => {
    return occ.attrs.taxon?.preferredId || occ.attrs.taxon?.warehouse_id;
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
