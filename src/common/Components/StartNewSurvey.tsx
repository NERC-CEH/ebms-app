import { useEffect, useContext } from 'react';
import { NavContext, isPlatform } from '@ionic/react';
import { useAlert } from '@flumens';
import appModel, { SurveyDraftKeys } from 'models/app';
import userModel from 'models/user';
import Sample from 'models/sample';
import savedSamples from 'models/collections/samples';
import { Survey } from 'common/config/surveys';
import { Geolocation } from '@capacitor/geolocation';

async function getNewSample(
  survey: Survey,
  draftIdKey: keyof SurveyDraftKeys,
  hasGPSPermission: any
) {
  const recorder = userModel.getPrettyName();

  const sample = await survey.create(
    Sample,
    recorder,
    undefined,
    undefined,
    hasGPSPermission
  );

  sample.setPreviousSpeciesGroups();
  savedSamples.push(sample);

  appModel.attrs[draftIdKey] = sample.cid;
  await appModel.save();

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
    } catch (err) {
      return null;
    }

    const { showGPSPermissionTip } = appModel.attrs;

    if (
      !showGPSPermissionTip ||
      isPlatform('ios') ||
      gpsPermission.coarseLocation === 'granted'
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
  const draftIdKey = `draftId:${survey.name}` as keyof SurveyDraftKeys;

  const pickDraftOrCreateSampleWrap = () => {
    const pickDraftOrCreateSample = async () => {
      if (!userModel.isLoggedIn()) {
        navigate(`/user/login`, 'none', 'replace');
        return;
      }

      const hasGrantedGps = await showGPSPermissionDialog();
      const sample = await getNewSample(survey, draftIdKey, hasGrantedGps);

      if (sample.isPreciseSingleSpeciesSurvey()) {
        navigate(
          `/survey/${survey.name}/${sample.cid}/edit/taxon`,
          'none',
          'replace'
        );
        return;
      }

      const path = sample.isDetailsComplete() ? '' : 'edit';

      navigate(`${baseURL}/${sample.cid}/${path}`, 'none', 'replace');
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
