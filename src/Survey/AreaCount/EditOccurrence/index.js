import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Header from 'common/Components/Header';
import Page from 'Components/Page';
import Footer from 'Components/PhotoPickerFooter';
import Main from './Main';
import './styles.scss';

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object,
  };

  render() {
    const { match, sample } = this.props;

    const occID = match.params.occId;
    const occurrence = sample.occurrences.find(occ => occ.cid === occID);
    const isDisabled = !!sample.metadata.synced_on;

    return (
      <Page id="area-count-edit-occurrence">
        <Header title={t('Edit Occurrence')} />
        <Main sample={sample} occurrence={occurrence} isDisabled={isDisabled} />
        <Footer model={occurrence} isDisabled={isDisabled} />
      </Page>
    );
  }
}

export default Container;
