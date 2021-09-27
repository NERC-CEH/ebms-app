import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { Page, Main, Header } from '@apps';
import appModel from 'appModel';
import TaxonSearch from 'Components/TaxonSearch';
import { NavContext } from '@ionic/react';
import Occurrence from 'occurrence';

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    subSample: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  render() {
    const { subSample: sectionSample, match } = this.props;

    const occID = match.params.occId;

    const getTaxonId = occ =>
      occ.attrs.taxon.preferredId || occ.attrs.taxon.warehouse_id;
    const recordedTaxa = sectionSample.occurrences.map(getTaxonId);

    const onSpeciesSelected = async taxon => {
      if (occID) {
        const byId = occ => occ.cid === occID;
        const occurrence = sectionSample.occurrences.find(byId);
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
            speciesGroups={appModel.attrs.speciesGroups}
          />
        </Main>
      </Page>
    );
  }
}

export default withRouter(Controller);
