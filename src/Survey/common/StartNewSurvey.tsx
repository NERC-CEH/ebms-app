import { useEffect, useContext } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useAlert, HandledError } from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import { GPS_DISABLED_ERROR_MESSAGE } from 'common/helpers/GPS';
import appModel, { SurveyDraftKeys } from 'models/app';
import samples from 'models/collections/samples';
import userModel from 'models/user';
import { Survey } from 'Survey/common/config';

async function showDraftAlert(alert: any) {
  const alertWrap = (resolve: any) => {
    alert({
      header: 'Draft',
      message: 'Previous survey draft exists, would you like to continue it?',
      backdropDismiss: false,
      buttons: [
        { text: 'Start new', handler: () => resolve(false) },
        { text: 'Continue', handler: () => resolve(true) },
      ],
    });
  };
  return new Promise(alertWrap);
}

async function getNewSample(survey: Survey, hasGPSPermission: any) {
  const recorder = userModel.getPrettyName();

  const sample = await survey.create!({ recorder, hasGPSPermission });
  samples.push(sample);
  sample.save();

  return sample;
}

async function getDraft(draftIdKey: keyof SurveyDraftKeys, alert: any) {
  const draftID = (appModel.data as any)[draftIdKey];
  if (!draftID) return null;

  const draftSample = samples.cidMap.get(draftID);
  if (!draftSample) return null;

  const continueDraftRecord = await showDraftAlert(alert);
  if (!continueDraftRecord) return null;

  return draftSample;
}

type Props = {
  survey: Survey;
};

const useShowGPSPermissionDialog = () => {
  const alert = useAlert();

  const showGPSPermissionDialog = async () => {
    //  Try block is required. If Device location is disabled Geolocation.checkPermissions() returns Error(Location services are not enabled) it will stop navigation to surveys page
    let gpsPermission;
    try {
      gpsPermission = await Geolocation.checkPermissions();
    } catch (err: any) {
      if (err?.message === GPS_DISABLED_ERROR_MESSAGE) {
        throw new HandledError(GPS_DISABLED_ERROR_MESSAGE);
      }
    }

    const { showGPSPermissionTip } = appModel.data;

    if (
      !showGPSPermissionTip ||
      isPlatform('ios') ||
      gpsPermission?.coarseLocation === 'granted'
    )
      return true;

    appModel.data.showGPSPermissionTip = false;
    appModel.save();

    const prompt = (resolve: any) => {
      alert({
        header: 'Location permission',
        message:
          'To automatically set species locations and track your route, even if the device is locked. Allow the app to use your location.',
        buttons: [
          { text: 'Deny', role: 'destructive', handler: () => resolve(false) },
          { text: 'Accept', handler: () => resolve(true) },
        ],
      });
    };

    return new Promise(prompt);
  };

  return showGPSPermissionDialog;
};

function StartNewSurvey({ survey }: Props): null {
  const { navigate } = useContext(NavContext);
  const alert = useAlert();

  const showGPSPermissionDialog = useShowGPSPermissionDialog();

  const baseURL = `/survey/${survey.name}`;
  const draftIdKey = `draftId:${survey.name}` as keyof SurveyDraftKeys;

  const pickDraftOrCreateSampleWrap = () => {
    const pickDraftOrCreateSample = async () => {
      if (!userModel.isLoggedIn()) {
        navigate('/user/login', 'none', 'replace');
        return;
      }

      let sample = await getDraft(draftIdKey, alert);
      if (!sample) {
        const ignoreError = () => {};
        const hasGrantedGps =
          await showGPSPermissionDialog().catch(ignoreError);
        sample = await getNewSample(survey, hasGrantedGps);
        (appModel.data as any)[draftIdKey] = sample.cid;
      }

      if (sample.isSingleSpeciesSurvey()) {
        navigate(
          `/survey/${survey.name}/${sample.id || sample.cid}/taxon`,
          'none',
          'replace'
        );
        return;
      }

      const path = sample.isDetailsComplete() ? '' : '/details';

      navigate(
        `${baseURL}/${sample.id || sample.cid}${path}`,
        'none',
        'replace'
      );
    };

    pickDraftOrCreateSample();
  };
  useEffect(pickDraftOrCreateSampleWrap, []);

  return null;
}

StartNewSurvey.with = (survey: Survey) => {
  const StartNewSurveyWithRouter = (params: any) => (
    <StartNewSurvey survey={survey} {...params} />
  );
  return StartNewSurveyWithRouter;
};

export default StartNewSurvey;
