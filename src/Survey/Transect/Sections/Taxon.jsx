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
    subSample: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  render() {
    const { subSample: sectionSample, match } = this.props;

    const occID = match.params.occId;

    const recordedTaxa = sectionSample.occurrences.map(
      occ => occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id
    );

    const onSpeciesSelected = async taxon => {
      if (occID) {
        const occurrence = sectionSample.occurrences.find(
          occ => occ.cid === occID
        );
        occurrence.attrs.taxon = taxon;
      } else {
        const survey = sectionSample.getSurvey();
        const occurrence = survey.occ.create(Occurrence, { taxon });
        sectionSample.occurrences.push(occurrence);
      }

      await sectionSample.save();
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
