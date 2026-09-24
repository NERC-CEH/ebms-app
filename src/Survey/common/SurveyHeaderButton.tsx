import { observer } from 'mobx-react';
import Sample from 'models/sample';
import HeaderButton from './HeaderButton';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sample: Sample<any>;
  onClick: () => void;
};

const SurveyHeaderButton = ({ sample, onClick }: Props) => {
  const isDisabled = sample.isUploaded;
  if (isDisabled) return null;

  const isInvalid = !!sample.validateRemote();

  return (
    <HeaderButton isInvalid={isInvalid} onClick={onClick}>
      {sample.metadata.saved ? 'common.upload' : 'common.finish'}
    </HeaderButton>
  );
};

export default observer(SurveyHeaderButton);
