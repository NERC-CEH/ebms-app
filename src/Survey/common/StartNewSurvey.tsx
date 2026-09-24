import { useEffect, useContext } from 'react';
import type { RouteComponentProps } from 'react-router';
import { Geolocation } from '@capacitor/geolocation';
import { useAlert, HandledError } from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import { GPS_DISABLED_ERROR_MESSAGE } from 'common/helpers/GPS';
import appModel, { SurveyDraftKeys } from 'models/app';
import samples from 'models/collections/samples';
import userModel from 'models/user';
import { Survey } from 'Survey/common/config';

async function showDraftAlert(alert: ReturnType<typeof useAlert>) {
  const alertWrap = (resolve: (continueDraft: boolean) => void) => {
    alert({
      header: 'common.draft',
      message: 'survey.previousSurveyDraft',
      backdropDismiss: false,
      buttons: [
        { text: 'survey.startNew', handler: () => resolve(false) },
        { text: 'common.continue', handler: () => resolve(true) },
      ],
    });
  };
  return new Promise<boolean>(alertWrap);
}

async function getNewSample(survey: Survey, hasGPSPermission?: boolean) {
  const recorder = userModel.getPrettyName();

  const sample = await survey.create!({ recorder, hasGPSPermission });
  samples.push(sample);
  sample.save();

  return sample;
}

async function getDraft(
  draftIdKey: keyof SurveyDraftKeys,
  alert: ReturnType<typeof useAlert>
) {
  const draftID = appModel.data[draftIdKey];
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
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === GPS_DISABLED_ERROR_MESSAGE
      ) {
        throw new HandledError('common.locationServicesDisabled');
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

    const prompt = (resolve: (granted: boolean) => void) => {
      alert({
        header: 'survey.locationPermission',
        message: 'survey.automaticallySetSpecies',
        buttons: [
          {
            text: 'survey.deny',
            role: 'destructive',
            handler: () => resolve(false),
          },
          { text: 'survey.accept', handler: () => resolve(true) },
        ],
      });
    };

    return new Promise<boolean>(prompt);
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
        const hasGrantedGps = await showGPSPermissionDialog().catch(
          () => false
        );
        sample = await getNewSample(survey, hasGrantedGps);
        appModel.data[draftIdKey] = sample.cid;

        if (sample.isSingleSpeciesSurvey()) {
          navigate(
            `/survey/${survey.name}/${sample.id || sample.cid}/taxon`,
            'none',
            'replace'
          );
          return;
        }
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
  const StartNewSurveyWithRouter = (params: RouteComponentProps) => (
    <StartNewSurvey survey={survey} {...params} />
  );
  return StartNewSurveyWithRouter;
};

export default StartNewSurvey;
