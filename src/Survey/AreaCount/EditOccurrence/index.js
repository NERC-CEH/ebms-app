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
    match: PropTypes.object.isRequired,
    sample: PropTypes.object.isRequired,
  };

  render() {
    const { match, sample } = this.props;

    const occID = match.params.occId;
    const occurrence = sample.occurrences.models.find(occ => occ.cid === occID);

    return (
      <IonPage>
        <AppHeader title={t('Edit Occurrence')} />
        <Main sample={sample} occurrence={occurrence} />
        <Footer sample={sample} />
      </IonPage>
    );
  }
}

export default Container;
