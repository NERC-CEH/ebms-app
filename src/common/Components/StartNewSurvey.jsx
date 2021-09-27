import React, { useEffect, useContext } from 'react';
import { NavContext } from '@ionic/react';
import { alert } from '@apps';
import appModel from 'appModel';
import userModel from 'userModel';
import Sample from 'sample';
import savedSamples from 'savedSamples';
import { Trans as T } from 'react-i18next';
import { withRouter } from 'react-router';

async function showDraftAlert() {
  const showDraftDialog = resolve => {
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

async function getDraft(draftIdKey) {
  const draftID = appModel.attrs[draftIdKey];
  if (draftID) {
    const draftById = ({ cid }) => cid === draftID;
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

async function getNewSample(survey, draftIdKey) {
  const sample = await survey.create(Sample);
  await sample.save();

  savedSamples.push(sample);

  appModel.attrs[draftIdKey] = sample.cid;
  await appModel.save();

  return sample;
}

function StartNewSurvey({ match, survey }) {
  const context = useContext(NavContext);

  const baseURL = `/survey/${survey.name}`;
  const draftIdKey = `draftId:${survey.name}`;

  const pickDraftOrCreateSampleWrap = () => {
    const pickDraftOrCreateSample = async () => {
      if (!userModel.hasLogIn()) {
        context.navigate(`/user/login`, 'none', 'replace');
        return;
      }

      if (match.path !== `${baseURL}/new`) {
        return;
      }

      let sample = await getDraft(draftIdKey);
      if (!sample) {
        sample = await getNewSample(survey, draftIdKey);
      }

      const url = match.url.replace('/new', '');

      context.navigate(`${url}/${sample.cid}/edit`, 'none', 'replace');
    };

    pickDraftOrCreateSample();
  };
  useEffect(pickDraftOrCreateSampleWrap, []);

  return null;
}
// eslint-disable-next-line @getify/proper-arrows/name
StartNewSurvey.with = survey => {
  const StartNewSurveyWithRouter = params => (
    <StartNewSurvey survey={survey} {...params} />
  );
  return withRouter(StartNewSurveyWithRouter);
};

export default withRouter(StartNewSurvey);
