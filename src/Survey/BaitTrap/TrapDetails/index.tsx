import { useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import Sample from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import { Data, SubSmpData } from '../config';
import Main from './Main';

const TrapDetailsController = () => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();

  const { sample, subSample } = useSample<
    Sample<Data>,
    any,
    Sample<SubSmpData>
  >();
  if (!sample || !subSample) return null;

  const onFinish = () => {
    subSample.metadata.completedDetails = true;
    subSample.save();

    const url = match.url.replace('/details', '');

    navigate(url, 'forward', 'replace');
  };

  const isInvalid = subSample.validateRemote();

  const nextButton = subSample.metadata.completedDetails ? null : (
    <HeaderButton onClick={onFinish} isInvalid={isInvalid}>
      Next
    </HeaderButton>
  );

  return (
    <Page id="survey-bait-trap-trap-detail">
      <Header title="Trap details" rightSlot={nextButton} />
      <Main subSample={subSample} />
    </Page>
  );
};

export default observer(TrapDetailsController);
