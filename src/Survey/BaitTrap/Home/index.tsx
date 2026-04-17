import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, useToast, useRemoteSample, useSample, Header } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';
import TrainingHeader from 'Survey/common/TrainingHeader';
import { useOnExit } from 'Survey/common/useExitConfirmation';
import survey, { Data } from '../config';
import Main from './Main';

const HomeController = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const toast = useToast();

  let { sample } = useSample<Sample<Data>>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample as any);
  const checkUserStatus = useUserStatusCheck();

  const onExit = useOnExit(sample);

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
      sample.cleanUp();
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

  const onAddTrapVisit = () => {
    if (!sample.data.locationId) {
      toast.warn('Please select a site first.');
      navigate(`${match.url}/details`);
      return;
    }

    navigate(`${match.url}/traps`);
  };

  return (
    <Page id="survey-bait-trap-home">
      <Header
        title="Bait-Trap Survey"
        rightSlot={
          <SurveyHeaderButton onClick={onSubmit} sample={sample as any} />
        }
        subheader={sample.data.training && <TrainingHeader />}
        defaultHref="/home/user-surveys"
        onLeave={!sample.metadata.saved ? onExit : undefined}
      />
      <Main sample={sample} onAddTrapVisit={onAddTrapVisit} />
    </Page>
  );
};

export default observer(HomeController);
