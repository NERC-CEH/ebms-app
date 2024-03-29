import { FC } from 'react';
import { observer } from 'mobx-react';
import { Button, Badge } from '@flumens';
import { IonSpinner } from '@ionic/react';
import Location from 'models/location';
import './styles.scss';

type Props = {
  location: Location;
  onUpload: any;
};
const OnlineStatus: FC<Props> = ({ location, onUpload }) => {
  const { saved } = location.metadata;

  if (!saved) return <Badge className="max-w-32">Draft</Badge>;

  if (location.remote.synchronising) {
    return <IonSpinner class="record-status" color="primary" />;
  }

  if (location.isUploaded()) return null;

  return (
    <Button color="secondary" shape="round" onPress={onUpload} preventDefault>
      Upload
    </Button>
  );
};

export default observer(OnlineStatus);
