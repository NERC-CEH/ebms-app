import { FC } from 'react';
import Sample from 'models/sample';
import { observer } from 'mobx-react';
import { Page, Header } from '@flumens';

import Main from './Main';

type Props = {
  sample: Sample;
};

const DetailsController: FC<Props> = ({ sample }) => {
  const onChangeCounter = (value: number) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.recorders = value;
    sample.save();
  };

  return (
    <Page id="survey-area-count-detail-edit">
      <Header title="Additional Details" />
      <Main sample={sample} onChangeCounter={onChangeCounter} />
    </Page>
  );
};

export default observer(DetailsController);
