import {
  resizeOutline,
  star,
  starOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import {
  IonItemSliding,
  IonItem,
  IonIcon,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';

type Props = {
  location: any;
  onSelect: any;
  onDelete: any;
  onEdit: any;
  distance: any;
};

const Entry = ({ location, onSelect, onDelete, onEdit, distance }: Props) => {
  const { id, name, favourite, area } = location;

  return (
    <IonItemSliding className="rounded-md">
      <IonItem
        detail={false}
        onClick={() => onSelect(id)}
        className="flex h-16 bg-white [--background:transparent] [--inner-border-width:0] [--inner-padding-end:0]"
      >
        <div className="flex w-full items-center justify-start gap-4">
          <div className="flex w-full flex-col gap-1 py-1">
            <h4 className="line-clamp-2">{name}</h4>
            {!!area && (
              <div className="text-xs">
                <IonIcon icon={resizeOutline} className="mr-1" />
                {area.toLocaleString()} m²
              </div>
            )}
          </div>

          <div className="flex flex-col items-end justify-between gap-3">
            <IonIcon
              icon={favourite ? star : starOutline}
              color={favourite ? 'tertiary' : 'medium'}
            />
            <div className="flex flex-nowrap items-center gap-1 text-xs">
              <div className="text-nowrap">{distance} km</div>
              <IonIcon icon={arrowForwardOutline} />
            </div>
          </div>
        </div>
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={() => onDelete(id)}>
          <T>Delete</T>
        </IonItemOption>
        <IonItemOption color="tertiary" onClick={() => onEdit(id)}>
          <T>Edit</T>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default Entry;
