/* eslint-disable camelcase */
import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import appModel from 'models/appModel';
import { observer } from 'mobx-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRouteMatch } from 'react-router';
import { Page, Header, alert, showInvalidsMessage } from '@apps';
import { isPlatform, IonButton, NavContext } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Main from './Main';
import './styles.scss';

const hapticsImpact = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });
};

function showDeleteSpeciesPrompt(occ: typeof Occurrence) {
  const prompt = () => {
    const name = occ.attrs.taxon.scientific_name;
    alert({
      header: 'Delete',
      message: `Are you sure you want to delete ${name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'primary',
        },
        {
          text: 'Delete',
          cssClass: 'secondary',
          handler: () => occ.destroy(),
        },
      ],
    });
  };

  return new Promise(prompt);
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

  const deleteOccurrence = (occ: typeof Occurrence) => {
    showDeleteSpeciesPrompt(occ);
  };

  const increaseCount = (occ: typeof Occurrence) => {
    if (sample.isDisabled()) {
      return;
    }

    // eslint-disable-next-line no-param-reassign
    occ.attrs.count += 1;
    occ.save();

    isPlatform('hybrid') && hapticsImpact();
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
