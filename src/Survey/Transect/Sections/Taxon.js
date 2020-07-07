import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Page, Main, Header } from '@apps';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import Occurrence from 'occurrence';

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object,
    sample: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  render() {
    const { sample: transectSample, match } = this.props;
    const sectionSampleId = match.params.sectionId;
    const sample = transectSample.getSectionSample(sectionSampleId);

    const occID = match.params.occId;

    const recordedTaxa = sample.occurrences.map(
      occ => occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id
    );

    const onSpeciesSelected = async taxon => {
      if (occID) {
        const occurrence = sample.occurrences.find(occ => occ.cid === occID);
        occurrence.attrs.taxon = taxon;
      } else {
        const occurrence = new Occurrence({ attrs: { taxon } });
        sample.occurrences.push(occurrence);
      }

      await sample.save();
      this.context.goBack();
    };

    return (
      <Page id="transect-sections-taxa">
        <Header title="Species" />
        <Main>
          <TaxonSearch
            onSpeciesSelected={onSpeciesSelected}
            recordedTaxa={recordedTaxa}
          />
        </Main>
      </Page>
    );
  }
}

export default Controller;
