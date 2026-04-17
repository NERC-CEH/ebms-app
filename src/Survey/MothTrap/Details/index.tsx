import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, useSample, useRemoteSample } from '@flumens';
import { NavContext } from '@ionic/react';
import groups from 'common/models/collections/groups';
import userModel from 'common/models/user';
import Sample, { useValidateCheck } from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import { useOnExitDetails } from 'Survey/common/useExitConfirmation';
import Main from './Main';
import './styles.scss';

const DetailsController = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();

  let { sample } = useSample<Sample>();
  sample = useRemoteSample(sample, () => userModel.isLoggedIn(), Sample);

  const checkSampleStatus = useValidateCheck(sample);

  const onExit = useOnExitDetails(sample);

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

  const group = groups.idMap.get(sample.data.groupId!);

  return (
    <Page id="survey-moth-detail">
      <Header
        title="Survey Details"
        rightSlot={getNextButton}
        onLeave={onExit}
      />
      <Main sample={sample} group={group} />
    </Page>
  );
};

export default observer(DetailsController);
