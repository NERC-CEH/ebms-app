import { useEffect, useContext } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useAlert, HandledError } from '@flumens';
import { NavContext, isPlatform } from '@ionic/react';
import { GPS_DISABLED_ERROR_MESSAGE } from 'common/helpers/GPS';
import appModel from 'models/app';
import savedSamples from 'models/collections/samples';
import Sample from 'models/sample';
import userModel from 'models/user';
import { Survey } from 'Survey/common/config';

async function getNewSample(survey: Survey, hasGPSPermission: any) {
  const recorder = userModel.getPrettyName();

  const sample = await survey.create!({
    Sample,
    recorder,
    hasGPSPermission,
  });

  sample.setPreviousSpeciesGroups();
  savedSamples.push(sample);

  sample.save();

  return sample;
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

    const { showGPSPermissionTip } = appModel.attrs;

    if (
      !showGPSPermissionTip ||
      isPlatform('ios') ||
      gpsPermission?.coarseLocation === 'granted'
    )
      return true;

    appModel.attrs.showGPSPermissionTip = false; // eslint-disable-line
    appModel.save();

    const prompt = (resolve: any) => {
      alert({
        header: 'Location permission',
        message:
          'To automatically set species locations and track your route, even if the device is locked. Allow the app to use your location.',
        buttons: [
          {
            text: 'Deny',
            role: 'destructive',
            cssClass: 'secondary',
            handler: () => {
              resolve(false);
            },
          },
          {
            text: 'Accept',
            cssClass: 'primary',
            handler: () => {
              resolve(true);
            },
          },
        ],
      });
    };

    return new Promise(prompt);
  };

  return showGPSPermissionDialog;
};

function StartNewSurvey({ survey }: Props): null {
  const { navigate } = useContext(NavContext);

  const showGPSPermissionDialog = useShowGPSPermissionDialog();

  const baseURL = `/survey/${survey.name}`;

  const pickDraftOrCreateSampleWrap = () => {
    const pickDraftOrCreateSample = async () => {
      if (!userModel.isLoggedIn()) {
        navigate(`/user/login`, 'none', 'replace');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const ignoreError = () => {};
      const hasGrantedGps = await showGPSPermissionDialog().catch(ignoreError);
      const sample = await getNewSample(survey, hasGrantedGps);

      if (sample.isPreciseSingleSpeciesSurvey()) {
        navigate(
          `/survey/${survey.name}/${sample.cid}/taxon`,
          'none',
          'replace'
        );
        return;
      }

      const path = sample.isDetailsComplete() ? '' : '/details';

      navigate(`${baseURL}/${sample.cid}${path}`, 'none', 'replace');
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
