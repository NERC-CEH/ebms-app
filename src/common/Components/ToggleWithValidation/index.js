import React from 'react';
import PropTypes from 'prop-types';
import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import Toggle from 'common/Components/Toggle';
import './styles.scss';

const InputWithValidation = ({
  name,
  label,
  icon,
  setFieldValue,
  values,
  errors,
  touched,
}) => {
  const error = errors[name] && touched[name];
  return (
    <>
      <IonItem error={!!error}>
        <IonIcon name={icon} faint size="small" slot="start" />
        <IonLabel text-wrap>{label}</IonLabel>
        <Toggle
          checked={values[name]}
          onToggle={val => setFieldValue(name, val)}
          name={name}
        />
      </IonItem>
      {error && (
        <div className="error-container">
          <div className="error-message">
            <ion-icon
              name="information-circle-outline"
              role="img"
              class="hydrated"
              aria-label="information circle outline"
            />
            <span>{t(errors[name])}</span>
          </div>
        </div>
      )}
    </>
  );
};

InputWithValidation.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
  icon: PropTypes.string,
  setFieldValue: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
};
export default InputWithValidation;
