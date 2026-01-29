import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, useRemoteSample, useSample, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Sample, { useValidateCheck } from 'models/sample';
import userModel, { useUserStatusCheck } from 'models/user';
import Header from './Header';
import Main from './Main';

const TransectHomeController = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();

  let { sample } = useSample<Sample>();
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

    appModel.data['draftId:transect'] = '';
    await appModel.save();

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
      <Header sample={sample} onSubmit={onSubmit} />
      <Main sample={sample} isDisabled={sample.isDisabled} />
    </Page>
  );
};

export default observer(TransectHomeController);
