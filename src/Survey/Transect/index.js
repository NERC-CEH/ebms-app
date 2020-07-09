import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { alert } from '@apps';
import { Trans as T } from 'react-i18next';
import { Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import modelFactory from 'common/models/model_factory';
import Edit from './Edit';
import Attr from './Attr';
import SectionsList from './Sections/List';
import SectionsEdit from './Sections/Edit';
import SectionsEditTaxa from './Sections/Taxon';
import SectionsEditCloud from './Sections/Cloud';
import SectionsEditReliability from './Sections/Reliability';

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
    userModel: PropTypes.object.isRequired,
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
    const sample = savedSamples.find(({ cid }) => cid === sampleID);
    this.setState({ sample });
  }

  addSectionSubSamples = () => {
    const { sample } = this.state;
    const transect = sample.attrs.location;
    transect.sections.forEach(section => {
      const sectionSample = modelFactory.createTransectSectionSample(section);
      sample.samples.push(sectionSample);
    });
    sample.save();
  };

  async getNewSample() {
    const { savedSamples, appModel } = this.props;
    const draftID = appModel.attrs.transectDraftId;
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

    const sample = await modelFactory.createTransectSample();
    appModel.attrs.transectDraftId = sample.cid;
    await appModel.save();
    return sample;
  }

  render() {
    const { appModel, userModel } = this.props;
    if (!this.state.sample) {
      return null;
    }

    const hasSectionSubSamples = true;

    return (
      <IonRouterOutlet>
        <Route
          path="/survey/transect/:id/edit"
          exact
          render={props => (
            <Edit sample={this.state.sample} appModel={appModel} {...props} />
          )}
        />

        <Route
          path="/survey/transect/:id/edit/:attr"
          exact
          render={props => {
            if (props && props.match.params.attr !== 'sections') {
              return <Attr sample={this.state.sample} {...props} />;
            }

            return (
              <SectionsList
                sample={this.state.sample}
                appModel={appModel}
                userModel={userModel}
                onTransectSelect={this.addSectionSubSamples}
                {...props}
              />
            );
          }}
        />

        {hasSectionSubSamples && (
          <Route
            path="/survey/transect/:id/edit/sections/:sectionId"
            exact
            render={props => (
              <SectionsEdit
                sample={this.state.sample}
                appModel={appModel}
                {...props}
              />
            )}
          />
        )}

        {hasSectionSubSamples && (
          <Route
            path="/survey/transect/:id/edit/sections/:sectionId/taxa"
            exact
            render={props => (
              <SectionsEditTaxa
                sample={this.state.sample}
                appModel={appModel}
                {...props}
              />
            )}
          />
        )}

        {hasSectionSubSamples && (
          <Route
            path="/survey/transect/:id/edit/sections/:sectionId/cloud"
            exact
            render={props => (
              <SectionsEditCloud
                sample={this.state.sample}
                appModel={appModel}
                {...props}
              />
            )}
          />
        )}

        {hasSectionSubSamples && (
          <Route
            path="/survey/transect/:id/edit/sections/:sectionId/reliability"
            exact
            render={props => (
              <SectionsEditReliability
                sample={this.state.sample}
                appModel={appModel}
                {...props}
              />
            )}
          />
        )}
      </IonRouterOutlet>
    );
  }
}

export default Routes;
