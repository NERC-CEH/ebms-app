import { checkmarkOutline, pinOutline } from 'ionicons/icons';
import { twMerge } from 'tailwind-merge';
import { IonIcon } from '@ionic/react';
import { isValidLocation } from 'common/flumens';

type Props = {
  name?: string;
  longitude?: number;
  latitude?: number;
  onClick: any;
  isSelected: boolean;
  className?: string;
};

const Entry = ({
  name,
  latitude,
  longitude,
  onClick,
  isSelected,
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
          ? 'border-[var(--form-value-color)] text-[var(--form-value-color)]'
          : 'border-neutral-200',
        className
      )}
    >
      <div
        className={twMerge(
          'absolute left-0 top-0 h-full w-full opacity-0',
          'bg-[var(--form-value-color)]',
          isSelected && 'opacity-[2%]',
          'transition-[opacity] duration-150'
        )}
      />
      <div className="flex w-full items-center justify-start gap-4">
        <div className="flex w-full flex-col gap-1 py-1">
          <div className="line-clamp-2 font-semibold">{name}</div>

          {isValid && (
            <div className="text-xs">
              <IonIcon icon={pinOutline} />
              {latitude!.toFixed(3)}, {longitude!.toFixed(3)}
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
