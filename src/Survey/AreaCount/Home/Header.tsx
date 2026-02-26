import { Header } from '@flumens';
import Group from 'common/models/group';
import Sample from 'models/sample';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';
import TrainingHeader from 'Survey/common/TrainingHeader';

type Props = {
  sample: Sample;
  group?: Group;
  onSubmit: any;
  onGroupClick: any;
};

const HeaderComponent = ({ sample, group, onSubmit, onGroupClick }: Props) => {
  const survey = sample.getSurvey();

  const trainingModeHeader = sample.data.training && <TrainingHeader />;

  const groupName = group?.data?.title;
  const groupHeader = !!groupName && (
    <div
      className="line-clamp-1 bg-tertiary-600 p-1 text-center text-sm text-white"
      onClick={onGroupClick}
    >
      {groupName}
    </div>
  );

  const trainingModeSubheader = (
    <>
      {trainingModeHeader}
      {groupHeader}
    </>
  );

  return (
    <Header
      title={survey.label}
      rightSlot={<SurveyHeaderButton onClick={onSubmit} sample={sample} />}
      subheader={trainingModeSubheader}
      defaultHref="/home/user-surveys"
    />
  );
};

export default HeaderComponent;
