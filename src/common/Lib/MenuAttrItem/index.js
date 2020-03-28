import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

function MenuAttrItem({ routerLink, disabled, label, value, icon, iconMode }) {
  const isDisabled = disabled;
  const iconProps =
    typeof icon === 'string'
      ? { mode: iconMode, src: icon }
      : { mode: iconMode, icon };

  return (
    <IonItem
      routerLink={routerLink}
      detail={!isDisabled}
      disabled={isDisabled}
      className="menu-attr-item"
    >
      <IonIcon slot="start" {...iconProps} />
      <IonLabel>
        <T>{label}</T>
      </IonLabel>
      <IonLabel slot="end">{value}</IonLabel>
    </IonItem>
  );
}

MenuAttrItem.propTypes = {
  routerLink: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  icon: PropTypes.PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    .isRequired,
  iconMode: PropTypes.string,
};

export default MenuAttrItem;
