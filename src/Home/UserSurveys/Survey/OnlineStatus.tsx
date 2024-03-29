import { observer } from 'mobx-react';
import clsx from 'clsx';
import { cloudOutline } from 'ionicons/icons';
import { Button, Badge } from '@flumens';
import { IonSpinner, IonIcon } from '@ionic/react';
import Sample from 'models/sample';
import './styles.scss';

type Props = {
  sample: Sample;
  onUpload: () => void;
  uploadIsPrimary?: boolean;
};

const OnlineStatus = ({ sample, onUpload, uploadIsPrimary }: Props) => {
  const { deprecated } = sample.getSurvey();
  if (deprecated) return null;

  const { saved } = sample.metadata;
  if (!saved) return <Badge className="max-w-32">Draft</Badge>;

  if (sample.remote.synchronising)
    return <IonSpinner className="mr-2 size-4" />;

  if (sample.isCached())
    return <IonIcon icon={cloudOutline} className="mr-2 size-4 opacity-50" />;

  if (sample.isUploaded()) return null;

  const isValid = !sample.validateRemote();

  return (
    <Button
      color={isValid ? 'secondary' : undefined}
      fill={!uploadIsPrimary ? 'outline' : undefined}
      onPress={onUpload}
      preventDefault
      className={clsx(
        'max-w-28 shrink-0 whitespace-nowrap px-4 py-1',
        !isValid && 'opacity-50'
      )}
    >
      Upload
    </Button>
  );
};

export default observer(OnlineStatus);
