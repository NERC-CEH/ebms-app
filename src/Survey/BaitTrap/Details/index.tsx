import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, useSample, useRemoteSample } from '@flumens';
import { NavContext } from '@ionic/react';
import userModel from 'common/models/user';
import Sample, { useValidateCheck } from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import { Data } from '../config';
import Main from './Main';

const DetailsController = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();

  let { sample } = useSample<Sample<Data>>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);

  if (!sample) return null;

  const onFinish = () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.metadata.completedDetails = true;
    sample.save();

    const url = match.url.replace('/details', '');

    navigate(url, 'forward', 'pop');
  };

  const isInvalid = sample.validateRemote();

  const nextButton = sample.isDetailsComplete() ? null : (
    <HeaderButton onClick={onFinish} isInvalid={isInvalid}>
      Next
    </HeaderButton>
  );

  return (
    <Page id="survey-bait-trap-detail">
      <Header title="Survey Details" rightSlot={nextButton} />
      <Main sample={sample} />
    </Page>
  );
};

export default observer(DetailsController);
