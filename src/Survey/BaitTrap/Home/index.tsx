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
import { Data } from '../config';
import Main from './Main';

const HomeController = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const toast = useToast();

  let { sample } = useSample<Sample<Data>>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

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

    await appModel.save();

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
    if (!sample.data.location?.id) {
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
        rightSlot={<SurveyHeaderButton onClick={onSubmit} sample={sample} />}
        subheader={sample.data.training && <TrainingHeader />}
        defaultHref="/home/user-surveys"
      />
      <Main sample={sample} onAddTrapVisit={onAddTrapVisit} />
    </Page>
  );
};

export default observer(HomeController);
