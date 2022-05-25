import { useContext, FC } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Sample, { useValidateCheck } from 'models/sample';
import { Page, useToast } from '@flumens';
import { useUserStatusCheck } from 'models/user';
import Header from './Header';
import Main from './Main';

type Props = {
  sample: Sample;
};

const TransectHomeController: FC<Props> = ({ sample }) => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const checkSampleStatus = useValidateCheck(sample);
  const checkUserStatus = useUserStatusCheck();

  const _processSubmission = async () => {
    const isUserOK = await checkUserStatus();
    if (!isUserOK) return;

    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.upload().catch(toast.error);

    navigate(`/home/user-surveys`, 'root');
  };

  const _processDraft = async () => {
    appModel.attrs['draftId:transect'] = '';
    await appModel.save();

    const saveAndReturn = () => {
      if (!sample.attrs.surveyEndTime) {
        // eslint-disable-next-line no-param-reassign
        sample.attrs.surveyEndTime = new Date();
      }
      sample.save();
      navigate(`/home/user-surveys`, 'root');
    };

    const isValid = checkSampleStatus();
    if (!isValid) {
      saveAndReturn();
      return;
    }

    // eslint-disable-next-line no-param-reassign
    sample.metadata.saved = true;
    saveAndReturn();
  };

  const onSubmit = async () => {
    if (!sample.metadata.saved) {
      await _processDraft();
      return;
    }

    await _processSubmission();
  };

  if (!sample) {
    return null;
  }

  const isTraining = sample.metadata.training;
  const isEditing = sample.metadata.saved;
  const isDisabled = !!sample.metadata.synced_on;

  return (
    <Page id="transect-edit">
      <Header
        onSubmit={onSubmit}
        isTraining={isTraining}
        isEditing={isEditing}
        isDisabled={isDisabled}
      />
      <Main sample={sample} isDisabled={isDisabled} />
    </Page>
  );
};

export default observer(TransectHomeController);
