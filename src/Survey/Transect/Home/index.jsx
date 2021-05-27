import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import showInvalidsMessage from 'helpers/invalidsMessage';
import { Page } from '@apps';
import Header from './Header';
import Main from './Main';

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  _processSubmission = async () => {
    if (await this.props.sample.upload())
      this.context.navigate(`/home/user-surveys`, 'root');
  };

  _processDraft = async () => {
    const { sample, appModel } = this.props;

    appModel.attrs['draftId:transect'] = null;
    await appModel.save();

    const saveAndReturn = () => {
      if (!sample.attrs.surveyEndTime) {
        sample.attrs.surveyEndTime = new Date();
      }
      sample.save();
      this.context.navigate(`/home/user-surveys`, 'root');
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
      <Page id="transect-edit">
        <Header
          onSubmit={this.onSubmit}
          isTraining={isTraining}
          isEditing={isEditing}
          isDisabled={isDisabled}
        />
        <Main sample={sample} isDisabled={isDisabled} />
      </Page>
    );
  }
}

export default Container;
