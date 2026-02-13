import { Header } from '@flumens';
import Sample from 'models/sample';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';
import TrainingHeader from 'Survey/common/TrainingHeader';

type Props = {
  sample: Sample;
  onSubmit: any;
  onGroupClick: any;
};

const HeaderComponent = ({ sample, onSubmit, onGroupClick }: Props) => {
  const survey = sample.getSurvey();

  const trainingModeHeader = sample.data.training && <TrainingHeader />;

  const group = sample.data.group?.title;
  const groupHeader = !!group && (
    <div
      className="line-clamp-1 bg-tertiary-600 p-1 text-center text-sm text-white"
      onClick={onGroupClick}
    >
      {group}
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
