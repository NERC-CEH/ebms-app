import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Page, Header, PhotoPicker } from '@apps';
import { IonFooter } from '@ionic/react';
import ImageModel from 'common/models/media';
import config from 'config';
import Main from './Main';
import './styles.scss';

@observer
class Container extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    sample: PropTypes.object.isRequired,
    subSample: PropTypes.object.isRequired,
    occurrence: PropTypes.object.isRequired,
  };

  render() {
    const { sample, subSample, occurrence, match } = this.props;
    const isDisabled = !!sample.metadata.synced_on;

    return (
      <Page id="area-count-edit-occurrence">
        <Header title="Edit Occurrence" />
        <Main
          match={match}
          occurrence={occurrence}
          subSample={subSample}
          isDisabled={isDisabled}
        />
        <IonFooter>
          <PhotoPicker
            model={occurrence}
            isDisabled={isDisabled}
            dataDirPath={config.dataPath}
            ImageClass={ImageModel}
          />
        </IonFooter>
      </Page>
    );
  }
}

export default Container;
