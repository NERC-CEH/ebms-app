import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import Sample from 'models/sample';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';

type Props = {
  sample: Sample;
  onSubmit: any;
  onProjectClick: any;
};

const HeaderComponent = ({ sample, onSubmit, onProjectClick }: Props) => {
  const isTraining = !!sample.attrs.training;

  const survey = sample.getSurvey();

  const project = sample.attrs.project?.name;

  const trainingModeSubheader = (
    <>
      {isTraining && (
        <div className="bg-black p-1 text-center text-sm text-white">
          <T>Training Mode</T>
        </div>
      )}

      {!!project && (
        <div
          className="line-clamp-1 bg-tertiary-600 p-1 text-center text-sm text-white"
          onClick={onProjectClick}
        >
          {project}
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
