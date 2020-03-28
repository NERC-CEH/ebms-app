import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Header from 'common/Components/Header';
import TaxonSearch from 'common/Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import Page from 'Components/Page';
import Main from 'Components/Main';
import Occurrence from 'occurrence';

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object,
    sample: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  render() {
    const { sample, match } = this.props;
    const occID = match.params.occId;

    const recordedTaxa = sample.occurrences.map(
      occ => occ.attrs.taxon.warehouse_id
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
      <Page id="area-count-edit-taxa">
        <Header title={t('Species')} />
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
