import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { observer } from 'mobx-react';
import { Page, Header, alert } from '@apps';
import { NavContext, withIonLifeCycle } from '@ionic/react';
import i18n from 'i18next';
import Main from './Main';
import './styles.scss';

function deleteSamplePrompt(cb) {
  alert({
    header: t('Delete'),
    message: i18n.t('Are you sure you want to delete this occurrence?'),
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Delete'),
        cssClass: 'secondary',
        handler: cb,
      },
    ],
  });
}

function byCreationDate(s1, s2) {
  const date1 = new Date(s1.metadata.updated_on);
  const date2 = new Date(s2.metadata.updated_on);

  return date2.getTime() - date1.getTime();
}

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  navigateToOccurrence = smp => {
    const { match } = this.props;
    const url = match.url.split('/speciesOccurrences');
    url.pop(); // go back to edit
    const occ = smp.occurrences[0];

    this.context.navigate(`${url}/samples/${smp.cid}/occ/${occ.cid}`);
  };

  ionViewWillEnter() {
    const samples = this.getSamples();
    if (!samples.length) {
      this.context.goBack();
    }
  }

  deleteSample = sample => {
    const deleteSample = async () => {
      await sample.destroy();
      const samples = this.getSamples();
      if (!samples.length) {
        this.context.goBack();
      }
    };

    deleteSamplePrompt(deleteSample);
  };

  getSamples = () => {
    const { match, sample } = this.props;

    const { taxa } = match.params;

    const matchesTaxa = ({ occurrences }) => {
      const [occ] = occurrences; // always one
      return occ.attrs.taxon.warehouse_id === parseInt(taxa, 10);
    };

    const samples = sample.samples.filter(matchesTaxa).sort(byCreationDate);

    return samples;
  };

  render() {
    const { sample } = this.props;
    const isDisabled = sample.isDisabled();

    return (
      <Page id="precise-area-count-edit-taxon-group">
        <Header title="Occurrences" />
        <Main
          sample={sample}
          samples={this.getSamples()}
          isDisabled={isDisabled}
          deleteSample={this.deleteSample}
          navigateToOccurrence={this.navigateToOccurrence}
        />
      </Page>
    );
  }
}

export default withIonLifeCycle(withRouter(Container));
