import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import modelFactory from 'common/models/model_factory';
import { AttrPage, alert } from '@apps';
import { Trans as T } from 'react-i18next';
import Edit from './Edit';
import EditOccurrence from './EditOccurrence';
import Taxon from './Taxon';
import AreaAttr from './Area';
import Details from './Details';
import OccurrenceComment from './OccurrenceComment';
import Stage from './Stage';

async function showDraftAlert() {
  return new Promise(resolve => {
    alert({
      header: t('Draft'),
      message: (
        <T>Previous survey draft exists, would you like to continue it?</T>
      ),
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
    savedSamples: PropTypes.array.isRequired,
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
      history.replace(`/survey/area/${newSample.cid}/edit`);
      return;
    }

    const sample = savedSamples.find(({ cid }) => cid === sampleID);
    this.setState({ sample });
  }

  async getNewSample() {
    const { savedSamples, appModel } = this.props;
    const draftID = appModel.attrs.areaCountDraftId;
    if (draftID) {
      const draftSample = savedSamples.find(({ cid }) => cid === draftID);
      if (draftSample) {
        const continueDraftRecord = await showDraftAlert();
        if (continueDraftRecord) {
          return draftSample;
        }

        draftSample.destroy();
      }
    }

    const sample = await modelFactory.createAreaCountSample();
    appModel.attrs.areaCountDraftId = sample.cid;
    await appModel.save();
    return sample;
  }

  render() {
    const { appModel, savedSamples } = this.props;
    if (!this.state.sample) {
      return null;
    }
    return (
      <IonRouterOutlet>
        <Route
          path="/survey/area/:id/edit/area"
          exact
          render={props => <AreaAttr sample={this.state.sample} {...props} />}
        />
        <Route
          path="/survey/area/:id/edit/taxa"
          exact
          render={props => <Taxon sample={this.state.sample} {...props} />}
        />
        <Route
          path="/survey/area/:id/edit/details"
          exact
          render={props => <Details sample={this.state.sample} {...props} />}
        />
        <Route
          path="/survey/area/:id/edit/details/:attr"
          exact
          render={props => <AttrPage sample={this.state.sample} {...props} />}
        />

        <Route
          path="/survey/area/:id/edit"
          exact
          render={props => (
            <Edit
              sample={this.state.sample}
              appModel={appModel}
              savedSamples={savedSamples}
              {...props}
            />
          )}
        />
        <Route
          path="/survey/area/:id/edit/occ/:occId/taxa"
          exact
          render={props => <Taxon sample={this.state.sample} {...props} />}
        />
        <Route
          path="/survey/area/:id/edit/occ/:occId/stage"
          exact
          render={props => <Stage sample={this.state.sample} {...props} />}
        />
        <Route
          path="/survey/area/:id/edit/occ/:occId/comment"
          exact
          render={props => (
            <OccurrenceComment sample={this.state.sample} {...props} />
          )}
        />
        <Route
          path="/survey/area/:id/edit/occ/:occId"
          exact
          render={props => (
            <EditOccurrence sample={this.state.sample} {...props} />
          )}
        />
      </IonRouterOutlet>
    );
  }
}

export default Routes;
