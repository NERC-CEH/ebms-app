import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, useSample, useRemoteSample } from '@flumens';
import { NavContext } from '@ionic/react';
import userModel from 'common/models/user';
import Sample, { useValidateCheck } from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import Main from './Main';
import './styles.scss';

const DetailsController = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();

  let { sample } = useSample<Sample>();
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

  const getNextButton = sample.isDetailsComplete() ? null : (
    <HeaderButton onClick={onFinish} isInvalid={isInvalid}>
      Next
    </HeaderButton>
  );

  return (
    <Page id="survey-moth-detail">
      <Header title="Survey Details" rightSlot={getNextButton} />
      <Main sample={sample} />
    </Page>
  );
};

export default observer(DetailsController);
