/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
import React, { FC, useContext } from 'react';
import Sample from 'models/sample';
import Occurrence from 'models/occurrence';
import appModel from 'models/appModel';
import CONFIG from 'common/config/config';
import { observer } from 'mobx-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useRouteMatch } from 'react-router';
import { Page, Header, alert, showInvalidsMessage, device, toast } from '@apps';
import Media from 'models/media';
import ImageHelp from 'common/Components/PhotoPicker/imageUtils';
import { isPlatform, IonButton, NavContext } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import { UNKNOWN_OCCURRENCE } from 'Survey/Moth/config';
import Main from './Main';
import './styles.scss';

const hapticsImpact = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });
};

const { warn } = toast;

function showDeleteSpeciesPrompt(occ: typeof Occurrence) {
  const prompt = () => {
    alert({
      header: 'Delete',
      message: `Are you sure you want to delete ${occ.getTaxonName()}?`,
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
  const { useImageIdentifier } = appModel.attrs;
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const isDisabled = sample.isDisabled();

  const surveyConfig = sample.getSurvey();

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

  const mergeOccurrence = (occ: typeof Occurrence) => {
    const unknowSpecies =
      occ.attrs.taxon?.warehouse_id === UNKNOWN_OCCURRENCE.warehouse_id;

    if (unknowSpecies) return;

    const identifiedSpecies = !occ.attrs?.taxon;

    if (identifiedSpecies) {
      occ.attrs.taxon = UNKNOWN_OCCURRENCE;
      occ.save();
      return;
    }

    const selectedTaxon = (selectedOccurrence: typeof Occurrence) =>
      selectedOccurrence.attrs.taxon?.warehouse_id ===
        occ.attrs.taxon?.warehouse_id && selectedOccurrence !== occ;
    const existingOcc = sample.occurrences.find(selectedTaxon);

    if (!existingOcc) return;

    existingOcc.attrs.count += 1;

    while (occ.media.length) {
      const copy = occ.media.pop();
      existingOcc.media.push(copy);
    }

    occ.destroy();
    existingOcc.save();
  };

  const onIdentifyAllOccurrence = async () => {
    const identifyOccurrence = async (occ: typeof Occurrence) => {
      await occ.identify();
      await mergeOccurrence(occ);
    };

    return sample.occurrences.forEach(identifyOccurrence);
  };

  const onIdentifyOccurrence = async (occ: typeof Occurrence) => {
    await occ.identify();

    mergeOccurrence(occ);
  };

  const photoSelect = async () => {
    if (!device.isOnline()) {
      warn('Looks like you are offline!');
      return;
    }

    const photo = await ImageHelp.getImage();
    if (!photo) return;

    const dataDirPath = CONFIG.dataPath;

    const image = await ImageHelp.getImageModel(Media, photo, dataDirPath);

    const identifier = sample.attrs.recorder;

    const taxon = null;

    const newOccurrence = surveyConfig.occ.create(
      Occurrence,
      taxon,
      identifier,
      image
    );

    sample.occurrences.push(newOccurrence);
    sample.save();

    if (!useImageIdentifier) {
      newOccurrence.attrs.taxon = UNKNOWN_OCCURRENCE;
      newOccurrence.save();
      return;
    }

    onIdentifyOccurrence(newOccurrence);
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
        photoSelect={photoSelect}
        useImageIdentifier={useImageIdentifier}
        onIdentifyOccurrence={onIdentifyOccurrence}
        onIdentifyAllOccurrence={onIdentifyAllOccurrence}
      />
    </Page>
  );
};

export default observer(HomeController);
