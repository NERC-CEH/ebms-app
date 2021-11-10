/* eslint-disable camelcase */
import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import appModel from 'models/appModel';
import { observer } from 'mobx-react';
import { Plugins, HapticsImpactStyle } from '@capacitor/core';
import { useRouteMatch } from 'react-router';
import { Page, Header, alert, showInvalidsMessage } from '@apps';
import { isPlatform, IonButton, NavContext } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Occurrence from 'models/occurrence';
import Main from './Main';
import './styles.scss';

const { Haptics } = Plugins;

function setSurveyEndTime(sample: typeof Sample) {
  sample.attrs.surveyEndime = new Date(); // eslint-disable-line no-param-reassign
  return sample.save();
}

  alert({
    header: 'Delete',
    message: `Are you sure you want to delete ${scientific_name}?`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Delete',
        cssClass: 'secondary',
        handler: () => {
          occ.destroy();
        },
      },
    ],
  });
}

interface Props {
  sample: typeof Sample;
}

const HomeController: FC<Props> = ({ sample }) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const isDisabled = sample.isDisabled();
  const isEditing = sample.metadata.saved;

  const _processSubmission = async () => {
    if (await sample.upload()) navigate(`/home/user-surveys`, 'root');
  };

  const _processDraft = async () => {
    const surveyName = sample.getSurvey().name;
    appModel.attrs[`draftId:${surveyName}`] = null;
    await appModel.save();

    const saveAndReturn = () => {
      setSurveyEndTime(sample);

      sample.cleanUp();
      sample.save();
      navigate(`/home/user-surveys`, 'root');
    };

    const invalids = sample.validateRemote();
    if (invalids) {
      showInvalidsMessage(invalids, saveAndReturn);
      return;
    }

    // eslint-disable-next-line no-param-reassign
    sample.metadata.saved = true;
    saveAndReturn();
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await _processDraft();
      return;
    }

    await _processSubmission();
  };

  const increaseCount = (taxon: any) => {
    if (sample.isDisabled()) {
      return;
    }

    const survey = sample.getSurvey();

    const newOccurrence = survey.occ.create(Occurrence, taxon);
    sample.occurrences.push(newOccurrence);
    sample.save();

    isPlatform('hybrid') && Haptics.impact({ style: HapticsImpactStyle.Heavy });
  };

  const getFinishButton = () => {
    const label = isEditing ? <T>Upload</T> : <T>Finish</T>;
    return <IonButton onClick={onSubmit}>{label}</IonButton>;
  };

  return (
    <Page id="survey-moth-home">
      <Header
        title="Moth-trap survey"
        rightSlot={!isDisabled && getFinishButton()}
      />
      <Main
        match={match}
        sample={sample}
        increaseCount={increaseCount}
        deleteSpecies={deleteOccurrence}
        isDisabled={isDisabled}
      />
    </Page>
  );
};

export default observer(HomeController);
