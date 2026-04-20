import { useContext } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, useSample } from '@flumens';
import { NavContext } from '@ionic/react';
import Occurrence from 'models/occurrence';
import Sample from 'models/sample';
import HeaderButton from 'Survey/common/HeaderButton';
import { Data, OccData } from '../config';
import Main from './Main';

const OccurrenceController = () => {
  const { goBack } = useContext(NavContext);

  const { sample, occurrence } = useSample<Sample<Data>, Occurrence<OccData>>();
  if (!sample || !occurrence) return null;

  const onFinish = () => goBack();

  const isInvalid = occurrence.validateRemote();

  const nextButton = !sample.isDisabled && (
    <HeaderButton onClick={onFinish} isInvalid={!!isInvalid}>
      Next
    </HeaderButton>
  );

  return (
    <Page id="survey-bait-trap-edit-occurrence">
      <Header title="Edit Occurrence" rightSlot={nextButton} />
      <Main occurrence={occurrence} />
    </Page>
  );
};

export default observer(OccurrenceController);
