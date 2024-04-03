import clsx from 'clsx';
import { checkboxOutline, pinOutline } from 'ionicons/icons';
import { IonItem, IonIcon } from '@ionic/react';
import Location from 'models/location';

type Props = {
  location: Location;
  onSelect: any;
  isSelected: boolean;
};

const Entry = ({ location, onSelect, isSelected }: Props) => {
  return (
    <IonItem
      detail={false}
      onClick={() => onSelect(location)}
      className={clsx(
        'flex h-16 rounded-md [--background:transparent] [--inner-border-width:0] [--inner-padding-end:0]',
        isSelected ? 'bg-green-50' : 'bg-white'
      )}
    >
      <div className="flex w-full items-center justify-start gap-4">
        <div className="flex w-full flex-col gap-1 py-1">
          <h4 className="line-clamp-2">{location.attrs.location.name}</h4>

          {location.attrs.location.latitude && (
            <div className="text-xs">
              <IonIcon icon={pinOutline} />
              {location.attrs.location.latitude.toFixed(3)},{' '}
              {location.attrs.location.longitude.toFixed(3)}
            </div>
          )}
        </div>

        {isSelected && (
          <IonIcon
            icon={checkboxOutline}
            className="size-10 text-success [--ionicon-stroke-width:20px]"
          />
        )}
      </div>
    </IonItem>
  );
};

export default Entry;
