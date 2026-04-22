import {
  arrowForwardOutline,
  checkmarkOutline,
  pinOutline,
} from 'ionicons/icons';
import { twMerge } from 'tailwind-merge';
import { IonIcon } from '@ionic/react';
import { Badge, isValidLocation } from 'common/flumens';

type Props = {
  name?: string;
  longitude?: number;
  latitude?: number;
  onClick: () => void;
  isSelected: boolean;
  hasLists?: boolean;
  distance?: number;
  className?: string;
};

const Site = ({
  name,
  latitude,
  longitude,
  onClick,
  isSelected,
  hasLists,
  distance,
  className,
}: Props) => {
  const isValid = isValidLocation({
    latitude: latitude!,
    longitude: longitude!,
  });

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'relative flex h-16 rounded-md border border-solid bg-white px-4 py-2 mb-2',
        isSelected
          ? 'border-(--form-value-color) text-(--form-value-color)'
          : 'border-neutral-200',
        className
      )}
    >
      <div
        className={twMerge(
          'absolute left-0 top-0 h-full w-full opacity-0',
          'bg-(--form-value-color)',
          isSelected && 'opacity-2',
          'transition-opacity duration-150'
        )}
      />
      <div className="flex w-full items-center justify-start gap-4">
        <div className="flex w-full flex-col gap-1 py-1">
          <div className="line-clamp-2 font-semibold">{name}</div>

          <div className="flex gap-2 items-center">
            {isValid && (
              <Badge size="small" prefix={<IonIcon icon={pinOutline} />}>
                {latitude!.toFixed(3)}, {longitude!.toFixed(3)}
              </Badge>
            )}

            {!!hasLists && <Badge size="small">Has species lists</Badge>}
          </div>
        </div>

        {!isSelected && !!distance && (
          <div className="flex flex-col items-end text-primary-700">
            <IonIcon icon={arrowForwardOutline} />
            <span className="whitespace-nowrap text-sm font-bold">
              {distance} km
            </span>
          </div>
        )}

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

export default Site;
