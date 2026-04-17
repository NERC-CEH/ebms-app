import { useContext } from 'react';
import { observer } from 'mobx-react';
import {
  Header,
  Page,
  useOnBackButton,
  useRemoteSample,
  useSample,
  useToast,
} from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';
import TrainingHeader from 'Survey/common/TrainingHeader';
import useExitConfirmation from 'Survey/common/useExitConfirmation';
import survey from '../config';
import Main from './Main';

const TransectHomeController = () => {
  const { navigate, goBack } = useContext(NavContext);
  const toast = useToast();

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();
  const confirmExit = useExitConfirmation();

  const onExit = async (setIsLeaving?: any) => {
    if (!sample?.metadata.saved) {
      const shouldExit = await confirmExit();
      if (!shouldExit) {
        setIsLeaving?.(false);
        return;
      }
    }
    goBack();
  };

  useOnBackButton(onExit);

  if (!sample) return null;

  const processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);

    navigate('/home/user-surveys', 'root');
  };

  const processDraft = async () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    (appModel.data as any)[`draftId:${survey.name}`] = '';

    const saveAndReturn = () => {
      if (!sample.data.surveyEndTime) {
        sample.data.surveyEndTime = new Date().toISOString();
      }
      sample.save();
      navigate('/home/user-surveys', 'root');
    };

    sample.metadata.saved = true;
    saveAndReturn();
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await processDraft();
      return;
    }

    await processSubmission();
  };

  return (
    <Page id="transect-edit">
      <Header
        title="Transect"
        rightSlot={<SurveyHeaderButton onClick={onSubmit} sample={sample} />}
        subheader={sample.data.training && <TrainingHeader />}
        defaultHref="/home/user-surveys"
        onLeave={onExit}
      />
      <Main sample={sample} isDisabled={sample.isDisabled} />
    </Page>
  );
};

export default observer(TransectHomeController);
