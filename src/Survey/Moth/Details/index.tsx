import { FC, useContext } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header } from '@flumens';
import { NavContext } from '@ionic/react';
import Sample, { useValidateCheck } from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
};

const DetailsController: FC<Props> = ({ sample }) => {
  const { navigate } = useContext(NavContext);
  const match = useRouteMatch();
  const checkSampleStatus = useValidateCheck(sample);

  const onFinish = () => {
    const isValid = checkSampleStatus();
    if (!isValid) return;

    sample.metadata.completedDetails = true; // eslint-disable-line
    sample.save();

    const url = match.url.replace('/details', '');

    navigate(url, 'forward', 'pop');
  };

  const isInValid = sample.validateRemote();

  const getNextButton = sample.isDetailsComplete() ? null : (
    <HeaderButton onClick={onFinish} isInValid={isInValid}>
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
