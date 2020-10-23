import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Page, Header, PhotoPicker } from '@apps';
import { IonFooter } from '@ionic/react';
import ImageModel from 'common/models/media';
import config from 'config';
import Main from './Main';

@observer
class Controller extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
  };

  render() {
    const { sample } = this.props;
    const isDisabled = sample.isDisabled();

    return (
      <Page id="survey-area-count-detail-edit">
        <Header title="Additional Details" />
        <Main {...this.props} />
        <IonFooter>
          <PhotoPicker
            model={sample}
            isDisabled={isDisabled}
            dataDirPath={config.dataPath}
            ImageClass={ImageModel}
          />
        </IonFooter>
      </Page>
    );
  }
}

export default Controller;
