import clsx from 'clsx';
import { calendarOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { DatetimePresentation } from '@ionic/core';
import {
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
} from '@ionic/react';

type Props = {
  label: any;
  value: any;
  onChange: (val: any) => void;
  isDisabled?: boolean;
  icon?: any;
  max?: string;
  id?: string;
  presentation?: DatetimePresentation;
};

const MenuDateAttr = ({
  id,
  label,
  icon = calendarOutline,
  presentation = 'date',
  value,
  onChange,
  isDisabled,
  max,
}: Props) => (
  <IonItem className="m-0! rounded-none! [--border-radius:0]! [--border-style:solid]! [--inner-padding-end:8px]!">
    <IonIcon src={icon} slot="start" />
    <IonLabel className="!opacity-100">
      <T>{label}</T>
    </IonLabel>

    <div className="flex items-center gap-1">
      <div>
        <div className={clsx('relative', !value && 'bg-[#edeef0] rounded-md')}>
          {!value && (
            <span className="absolute left-1/2 -translate-x-1/2 py-2 opacity-50 text-xs">
              {presentation === 'time' ? '-- : --' : ''}
            </span>
          )}
          <IonDatetimeButton
            datetime={`date-time-picker-${id || label}`}
            slot="end"
            className={clsx(
              '[--ion-text-color:var(--form-value-color)]',
              !value && '[&::part(native)]:opacity-0'
            )}
            onClick={() => {
              if (!value) onChange(new Date().toISOString());
            }}
          />
        </div>
        <IonModal keepContentsMounted className="[--border-radius:10px]">
          <IonDatetime
            id={`date-time-picker-${id || label}`}
            presentation={presentation}
            preferWheel
            onIonChange={(e: any) => onChange(e.detail.value)}
            value={value}
            disabled={isDisabled}
            max={max}
            formatOptions={{
              date: { day: '2-digit', month: '2-digit', year: '2-digit' },
              time: { hour: '2-digit', minute: '2-digit' },
            }}
          />
        </IonModal>
      </div>
    </div>
  </IonItem>
);

export default MenuDateAttr;
