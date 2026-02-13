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
  presentation?: DatetimePresentation;
};

const MenuDateAttr = ({
  label,
  icon = calendarOutline,
  presentation = 'date',
  value,
  onChange,
  isDisabled,
}: Props) => (
  <IonItem className="m-0! rounded-none! [--border-radius:0]! [--border-style:solid]! [--inner-padding-end:8px]!">
    <IonIcon src={icon} slot="start" />
    <IonLabel className="!opacity-100">
      <T>{label}</T>
    </IonLabel>

    <div className="flex items-center gap-1">
      <div>
        <IonDatetimeButton
          datetime={`date-time-picker-${label}`}
          slot="end"
          className="[--ion-text-color:var(--form-value-color)]"
        />
        <IonModal keepContentsMounted className="[--border-radius:10px]">
          <IonDatetime
            id={`date-time-picker-${label}`}
            presentation={presentation}
            preferWheel
            onIonChange={(e: any) => onChange(e.detail.value)}
            value={value}
            disabled={isDisabled}
            max={new Date().toISOString()}
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
