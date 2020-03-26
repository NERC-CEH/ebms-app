import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import showInvalidsMessage from 'helpers/invalidsMessage';
import Header from './Header';
import Main from './Main';

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    history: PropTypes.object,
  };

  _processSubmission = () => {
    const { sample, history } = this.props;

    const invalids = sample.validateRemote();
    if (invalids) {
      showInvalidsMessage(invalids);
      return;
    }

    sample.saveRemote();

    history.replace(`/home/user-surveys`);
  };

  _processDraft = async () => {
    const { sample, history, appModel } = this.props;

    appModel.attrs.transectDraftId = null;
    await appModel.save();

    const saveAndReturn = () => {
      if (!sample.attrs.surveyEndTime) {
        sample.attrs.surveyEndTime = new Date();
      }
      sample.save();
      history.replace(`/home/user-surveys`);
    };

    const errors = sample.validateRemote();
    if (errors) {
      showInvalidsMessage(errors, saveAndReturn);
      return;
    }

    sample.metadata.saved = true;
    saveAndReturn();
  };

  onSubmit = async () => {
    const { sample } = this.props;

    if (!sample.metadata.saved) {
      await this._processDraft();
      return;
    }

    await this._processSubmission();
  };

  render() {
    const { sample } = this.props;

    if (!sample) {
      return null;
    }

    const isTraining = sample.metadata.training;
    const isEditing = sample.metadata.saved;
    const isDisabled = !!sample.metadata.synced_on;

    return (
      <IonPage>
        <Header
          onSubmit={this.onSubmit}
          isTraining={isTraining}
          isEditing={isEditing}
          isDisabled={isDisabled}
        />
        <Main sample={sample} isDisabled={isDisabled} />
      </IonPage>
    );
  }
}

export default Container;
