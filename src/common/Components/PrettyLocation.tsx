import { observer } from 'mobx-react';
import { prettyPrintLocation } from '@flumens';
import { IonSpinner } from '@ionic/react';
import Sample from 'common/models/sample';

function getValue(sample: Sample) {
  if (sample.isGPSRunning()) {
    return <IonSpinner className="w-3.75" />;
  }

  return prettyPrintLocation(sample.data.location);
}

type Props = {
  sample: Sample;
};

function PrettyLocation({ sample }: Props) {
  const value = getValue(sample);

  return <div className="text-[1em] ml-0">{value}</div>;
}

export default observer(PrettyLocation);
