import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import alert from 'common/helpers/alert';
import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import modelFactory from 'common/models/model_factory';
import Edit from './Edit';

async function showDraftAlert() {
  return new Promise(resolve => {
    alert({
      header: t('Draft'),
      message: `${t(
        'Previous survey draft exists, would you like to continue it?'
      )}`,
      backdropDismiss: false,
      buttons: [
        {
          text: t('Discard'),
          handler: () => {
            resolve(false);
          },
        },
        {
          text: t('Continue'),
          cssClass: 'primary',
          handler: () => {
            resolve(true);
          },
        },
      ],
    });
  });
}

@observer
class Routes extends React.Component {
  static propTypes = {
    savedSamples: PropTypes.object.isRequired,
    match: PropTypes.object,
    history: PropTypes.object,
    appModel: PropTypes.object.isRequired,
  };

  state = { sample: null };

  async componentDidMount() {
    const { savedSamples, match, history } = this.props;
    const sampleID = match.params.id;

    if (sampleID === 'new') {
      const newSample = await this.getNewSample();
      this.setState({ sample: newSample });
      history.replace(`/survey/transect/${newSample.cid}/edit`);
      return;
    }

    this.setState({ sample: savedSamples.get(sampleID) });
  }

  async getNewSample() {
    const { savedSamples, appModel } = this.props;
    const draftID = appModel.get('transectDraftId');
    if (draftID) {
      const draftWasNotDeleted = savedSamples.get(draftID);
      if (draftWasNotDeleted) {
        const continueDraftRecord = await showDraftAlert();
        if (continueDraftRecord) {
          return savedSamples.get(draftID);
        }

        savedSamples.get(draftID).destroy();
      }
    }

    const sample = await modelFactory.createTransectSample();
    appModel.set('transectDraftId', sample.cid);
    await appModel.save();
    return sample;
  }

  render() {
    const { appModel } = this.props;
    if (!this.state.sample) {
      return null;
    }

    return (
      <IonRouterOutlet>
        <Route
          path="/survey/transect/:id/edit"
          exact
          render={props => (
            <Edit sample={this.state.sample} appModel={appModel} {...props} />
          )}
        />
      </IonRouterOutlet>
    );
  }
}

export default Routes;
