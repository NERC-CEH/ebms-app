import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import Sample from 'models/sample';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';

type Props = {
  sample: Sample;
  onSubmit: any;
  onGroupClick: any;
};

const HeaderComponent = ({ sample, onSubmit, onGroupClick }: Props) => {
  const isTraining = !!sample.data.training;

  const survey = sample.getSurvey();

  const group = sample.data.group?.title;

  const trainingModeSubheader = (
    <>
      {isTraining && (
        <div className="bg-black p-1 text-center text-sm text-white">
          <T>Training Mode</T>
        </div>
      )}

      {!!group && (
        <div
          className="line-clamp-1 bg-tertiary-600 p-1 text-center text-sm text-white"
          onClick={onGroupClick}
        >
          {group}
        </div>
      )}
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
