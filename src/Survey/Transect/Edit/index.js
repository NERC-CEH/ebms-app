import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import alert from 'common/helpers/alert';
import Header from './Header';
import Main from './Main';

function showValidationAlert(errors, onSaveDraft) {
  const errorsPretty = errors.errors.reduce(
    (agg, err) => `${agg} ${t(err)}`,
    ''
  );
  alert({
    header: t('Survey incomplete'),
    message: `${errorsPretty}`,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
      },
      {
        text: t('Save Draft'),
        cssClass: 'secondary',
        handler: onSaveDraft,
      },
    ],
  });
}

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    history: PropTypes.object,
  };

  _processSubmission = async () => {
    const { sample, history } = this.props;

    const errors = await sample.validateRemote();
    if (errors) {
      showValidationAlert(errors);
      return;
    }
    sample.error.message = null;

    sample.save(null, { remote: true }).catch(e => {
      sample.error.message = e.message;
    });
    history.replace(`/home/user-surveys`);
  };

  _processDraft = async () => {
    const { sample, history, appModel } = this.props;

    appModel.set('transectDraftId', null);
    await appModel.save();

    const saveAndReturn = () => {
      if (!sample.get('surveyEndTime')) {
        sample.set('surveyEndTime', new Date());
      }
      sample.save();
      history.replace(`/home/user-surveys`);
    };

    const errors = await sample.validateRemote();
    if (errors) {
      showValidationAlert(errors, saveAndReturn);
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
    return (
      <IonPage>
        <Header
          onSubmit={this.onSubmit}
          isTraining={isTraining}
          isEditing={isEditing}
        />
        <Main sample={sample} />
      </IonPage>
    );
  }
}

export default Container;
