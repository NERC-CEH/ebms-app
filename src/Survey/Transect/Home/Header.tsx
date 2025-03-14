import { Trans as T } from 'react-i18next';
import { Header } from '@flumens';
import Sample from 'models/sample';
import SurveyHeaderButton from 'Survey/common/SurveyHeaderButton';

type Props = {
  sample: Sample;
  onSubmit: any;
};

const HeaderComponent = ({ sample, onSubmit }: Props) => {
  const isTraining = !!sample.data.training;

  const trainingModeSubheader = isTraining && (
    <div className="training-survey">
      <T>Training Mode</T>
    </div>
  );

  return (
    <Header
      title="Transect"
      rightSlot={<SurveyHeaderButton onClick={onSubmit} sample={sample} />}
      subheader={trainingModeSubheader}
      defaultHref="/home/user-surveys"
    />
  );
};

export default HeaderComponent;
