import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import { Page, Main, Header } from '@apps';
import Sample from 'sample';
import Occurrence from 'occurrence';

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
    if (taxa) {
      sample.samples
        .filter(({ occurrences }) => {
          const [occ] = occurrences; // always one
          return occ.attrs.taxon.warehouse_id === parseInt(taxa, 10);
        })
        .forEach(({ occurrences }) => {
          const [occ] = occurrences; // always one
          occ.attrs.taxon = taxon;
        });

      const url = match.url.split('/speciesOccurrences');
      url.pop();

      await sample.save();
      this.context.goBack();
      return;
    }

    if (occurrence) {
      occurrence.attrs.taxon = taxon;
    } else {
      const survey = sample.getSurvey();
      const newSample = survey.smp.create(Sample, Occurrence, taxon);
      sample.samples.push(newSample);
    }

    await sample.save();
    this.context.goBack();
  };

  render() {
    const { sample } = this.props;

    const species = sample.samples.map(smp => {
      const occ = smp.occurrences[0];
      return occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
    });

    const shallowSpecies = sample.shallowSpeciesList.map(
      taxon => taxon.preferredId || taxon.warehouse_id
    );

    const recordedTaxa = [...species, ...shallowSpecies];

    return (
      <Page id="precise-area-count-edit-taxa">
        <Header title="Species" />
        <Main>
          <TaxonSearch
            onSpeciesSelected={this.onSpeciesSelected}
            recordedTaxa={recordedTaxa}
          />
        </Main>
      </Page>
    );
  }
}

export default withRouter(Controller);
