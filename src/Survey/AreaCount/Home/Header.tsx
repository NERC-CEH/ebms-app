import { Header } from '@flumens';
import Sample from 'models/sample';
import GroupHeader from 'Survey/common/GroupHeader';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';
import TrainingHeader from 'Survey/common/TrainingHeader';

type Props = {
  sample: Sample;
  isDisabled: boolean;
  onSubmit: () => void;
  onGroupClick: () => void;
  onLeave?: () => void;
};

const HeaderComponent = ({
  sample,
  isDisabled,
  onSubmit,
  onGroupClick,
  onLeave,
}: Props) => {
  const survey = sample.getSurvey();

  const trainingModeHeader = sample.data.training && <TrainingHeader />;

  const trainingModeSubheader = (
    <>
      {trainingModeHeader}
      <GroupHeader
        groupId={sample.data.groupId}
        isDisabled={isDisabled}
        onClick={onGroupClick}
      />
    </>
  );

  return (
    <Header
      title={survey.label}
      rightSlot={<SurveyHeaderButton onClick={onSubmit} sample={sample} />}
      subheader={trainingModeSubheader}
      defaultHref="/home/user-surveys"
      onLeave={onLeave}
    />
  );
};

export default HeaderComponent;
