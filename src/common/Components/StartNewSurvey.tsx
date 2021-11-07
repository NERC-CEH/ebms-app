import React, { useEffect, useContext } from 'react';
import { NavContext } from '@ionic/react';
import { alert } from '@apps';
import appModel from 'models/appModel';
import userModel from 'models/userModel';
import Sample from 'models/sample';
import savedSamples from 'models/savedSamples';
import { Trans as T } from 'react-i18next';
import { Survey } from 'common/config/surveys';

async function showDraftAlert() {
  const showDraftDialog = (resolve: any) => {
    alert({
      header: 'Draft',
      message: (
        <T>Previous survey draft exists, would you like to continue it?</T>
      ),
      backdropDismiss: false,
      buttons: [
        {
          text: 'Discard',
          handler: () => {
            resolve(false);
          },
        },
        {
          text: 'Continue',
          cssClass: 'primary',
          handler: () => {
            resolve(true);
          },
        },
      ],
    });
  };
  return new Promise(showDraftDialog);
}

async function getDraft(draftIdKey: string) {
  const draftID = appModel.attrs[draftIdKey];
  if (draftID) {
    const draftById = ({ cid }: typeof Sample) => cid === draftID;
    const draftSample = savedSamples.find(draftById);
    if (draftSample && !draftSample.isDisabled()) {
      const continueDraftRecord = await showDraftAlert();
      if (continueDraftRecord) {
        return draftSample;
      }

      draftSample.destroy();
    }
  }

  return null;
}

async function getNewSample(survey: Survey, draftIdKey: string) {
  const recorder = userModel.getPrettyName();

  const sample = await survey.create(Sample, undefined, undefined, recorder);
  await sample.save();

  savedSamples.push(sample);

  appModel.attrs[draftIdKey] = sample.cid;
  await appModel.save();

  return sample;
}

type Props = {
  survey: Survey;
};

function StartNewSurvey({ survey }: Props): null {
  const context = useContext(NavContext);

  const baseURL = `/survey/${survey.name}`;
  const draftIdKey = `draftId:${survey.name}`;

  const pickDraftOrCreateSampleWrap = () => {
    const pickDraftOrCreateSample = async () => {
      if (!userModel.hasLogIn()) {
        context.navigate(`/user/login`, 'none', 'replace');
        return;
      }

      let sample = await getDraft(draftIdKey);
      if (!sample) {
        sample = await getNewSample(survey, draftIdKey);
      }

      context.navigate(`${baseURL}/${sample.cid}/edit`, 'none', 'replace');
    };

    pickDraftOrCreateSample();
  };
  useEffect(pickDraftOrCreateSampleWrap, []);

  return null;
}

// eslint-disable-next-line @getify/proper-arrows/name
StartNewSurvey.with = (survey: Survey) => {
  const StartNewSurveyWithRouter = (params: any) => (
    <StartNewSurvey survey={survey} {...params} />
  );
  return StartNewSurveyWithRouter;
};

export default StartNewSurvey;
