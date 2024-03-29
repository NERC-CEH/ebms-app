import { useContext, FC } from 'react';
import { observer } from 'mobx-react';
import { Page, useToast } from '@flumens';
import { NavContext } from '@ionic/react';
import appModel from 'models/app';
import Sample, { useValidateCheck } from 'models/sample';
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
    const isValid = checkSampleStatus();
    if (!isValid) return;

    appModel.attrs['draftId:transect'] = '';
    await appModel.save();

    const saveAndReturn = () => {
      if (!sample.attrs.surveyEndTime) {
        // eslint-disable-next-line no-param-reassign
        sample.attrs.surveyEndTime = new Date().toISOString();
      }
      sample.save();
      navigate(`/home/user-surveys`, 'root');
    };

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

  const isDisabled = sample.isDisabled();

  return (
    <Page id="transect-edit">
      <Header sample={sample} onSubmit={onSubmit} />
      <Main sample={sample} isDisabled={isDisabled} />
    </Page>
  );
};

export default observer(TransectHomeController);
