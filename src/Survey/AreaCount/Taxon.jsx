import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import { Page, Main, Header, alert } from '@apps';
import appModel from 'appModel';
import Sample from 'sample';
import Occurrence from 'occurrence';
import { Trans as T } from 'react-i18next';

async function showMergeSpeciesAlert() {
  const showMergeSpeciesDialog = resolve => {
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

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    sample: PropTypes.object.isRequired,
    occurrence: PropTypes.object,
  };

  static contextType = NavContext;

  onSpeciesSelected = async taxon => {
    const { sample, occurrence, match } = this.props;
    const { taxa } = match.params;
    const { isRecorded } = taxon;

    if (taxa && isRecorded) {
      const mergeSpecies = await showMergeSpeciesAlert();

      if (!mergeSpecies) {
        return;
      }
    }

    if (taxa) {
      const selectedTaxon = ({ occurrences }) => {
        const [occ] = occurrences; // always one
        return occ.attrs.taxon.warehouse_id === parseInt(taxa, 10);
      };
      const assignTaxon = ({ occurrences }) => {
        const [occ] = occurrences; // always one
        occ.attrs.taxon = taxon;
      };
      sample.samples.filter(selectedTaxon).forEach(assignTaxon);

      await sample.save();

      const [url] = match.url.split('/speciesOccurrences');
      this.context.navigate(url, 'pop');

      return;
    }

    if (occurrence) {
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
    this.context.goBack();
  };

  render() {
    const { sample } = this.props;

    const getTaxonId = smp => {
      const occ = smp.occurrences[0];
      return occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
    };
    const species = sample.samples.map(getTaxonId);

    const getShallowTaxonId = taxon => taxon.preferredId || taxon.warehouse_id;
    const shallowSpecies = sample.shallowSpeciesList.map(getShallowTaxonId);

    const recordedTaxa = [...species, ...shallowSpecies];

    return (
      <Page id="precise-area-count-edit-taxa">
        <Header title="Species" />
        <Main>
          <TaxonSearch
            onSpeciesSelected={this.onSpeciesSelected}
            recordedTaxa={recordedTaxa}
            speciesGroups={appModel.attrs.speciesGroups}
          />
        </Main>
      </Page>
    );
  }
}

export default withRouter(Controller);
