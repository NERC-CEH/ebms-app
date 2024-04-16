import clsx from 'clsx';
import { checkmarkOutline, pinOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import Location from 'models/location';

type Props = {
  location: Location;
  onSelect: any;
  isSelected: boolean;
};

const Entry = ({ location, onSelect, isSelected }: Props) => {
  return (
    <div
      onClick={() => onSelect(location)}
      className={clsx(
        'relative flex h-16 rounded-md border border-solid bg-white px-4 py-2',
        isSelected
          ? 'border-[var(--form-value-color)] text-[var(--form-value-color)]'
          : 'border-neutral-200'
      )}
    >
      <div
        className={clsx(
          'absolute left-0 top-0 h-full w-full opacity-0',
          'bg-[var(--form-value-color)]',
          isSelected && 'opacity-[2%]',
          'transition-[opacity] duration-150'
        )}
      />
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
            icon={checkmarkOutline}
            className="size-10 [--ionicon-stroke-width:20px]"
          />
        )}
      </div>
    </div>
  );
};

export default Entry;
