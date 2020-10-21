import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import { Page, Main, Header } from '@apps';
import Occurrence from 'occurrence';

@observer
class Controller extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    occurrence: PropTypes.object,
  };

  static contextType = NavContext;

  render() {
    const { sample, occurrence } = this.props;

    const recordedTaxa = sample.occurrences.map(
      occ => occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id
    );

    const onSpeciesSelected = async taxon => {
      if (occurrence) {
        occurrence.attrs.taxon = taxon;
      } else {
        const survey = sample.getSurvey();
        const newOccurrence = survey.occ.create(Occurrence, { taxon });
        sample.occurrences.push(newOccurrence);
      }

      await sample.save();
      this.context.goBack();
    };

    return (
      <Page id="area-count-edit-taxa">
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
