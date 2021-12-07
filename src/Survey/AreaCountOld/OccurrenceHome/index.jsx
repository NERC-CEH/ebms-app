import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { Page, Header } from '@apps';
import PhotoPicker from 'common/Components/PhotoPicker';
import { IonFooter } from '@ionic/react';
import Main from './Main';
import './styles.scss';

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  render() {
    const { match, sample } = this.props;

    const occID = match.params.occId;
    const byOccId = occ => occ.cid === occID;
    const occurrence = sample.occurrences.find(byOccId);
    const isDisabled = !!sample.metadata.synced_on;

    return (
      <Page id="area-count-edit-occurrence">
        <Header title="Edit Occurrence" />
        <Main sample={sample} occurrence={occurrence} isDisabled={isDisabled} />
        <IonFooter>
          <PhotoPicker model={occurrence} />
        </IonFooter>
      </Page>
    );
  }
}

export default withRouter(Container);
