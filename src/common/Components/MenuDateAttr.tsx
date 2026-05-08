import { calendarOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { DatetimeButton, type DatetimeButtonProps } from 'common/flumens';
import appModel from 'common/models/app';

type Props = {
  label: any;
  icon?: any;
} & DatetimeButtonProps;

const MenuDateAttr = ({
  id = '',
  label,
  icon = calendarOutline,
  ...props
}: Props) => (
  <IonItem className="m-0! rounded-none! [--border-radius:0]! [--border-style:solid]! [--inner-padding-end:8px]!">
    <IonIcon src={icon} slot="start" />
    <IonLabel className="!opacity-100">
      <T>{label}</T>
    </IonLabel>

    <DatetimeButton
      id={`${id}${label}`}
      locale={appModel.data.language || undefined}
      {...props}
    />
  </IonItem>
);

export default MenuDateAttr;
