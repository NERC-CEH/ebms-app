import { observer } from 'mobx-react';
import { Button, Badge } from '@flumens';
import { IonSpinner } from '@ionic/react';
import Location from 'models/location';

type Props = {
  location: Location;
  onUpload: any;
};
const OnlineStatus = ({ location, onUpload }: Props) => {
  if (!location.metadata.saved)
    return <Badge className="max-w-32">Draft</Badge>;

  if (location.isSynchronising) return <IonSpinner className="mr-2 size-4" />;

  if (location.isUploaded) return null;

  return (
    <Button
      color="secondary"
      onPress={onUpload}
      preventDefault
      className="max-w-28 shrink-0 whitespace-nowrap px-4 py-1"
    >
      Upload
    </Button>
  );
};

export default observer(OnlineStatus);
