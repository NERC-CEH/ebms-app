import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'common/Components/Header';
import { IonPage } from '@ionic/react';

import Main from './Main';
import Footer from './Footer';
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
    const occurrence = sample.occurrences.models.find(occ => occ.cid === occID);
    const isDisabled = !!sample.metadata.synced_on;

    return (
      <IonPage id="area-count-edit-occurrence">
        <AppHeader title={t('Edit Occurrence')} />
        <Main sample={sample} occurrence={occurrence} isDisabled={isDisabled} />
        <Footer occurrence={occurrence} isDisabled={isDisabled} />
      </IonPage>
    );
  }
}

export default Container;
