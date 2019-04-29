import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  IonPage,
  IonIcon,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
} from '@ionic/react';
import appModel from 'app_model';
import './styles.scss';

function SelectLanguage({ onSelect }) {
  return (
    <IonPage id="language-country-select">
      <IonList>
        <div className="header">
          <IonIcon name="globe" size="large" />
          <h4>Select your language</h4>
        </div>
        <IonRadioGroup onIonChange={onSelect}>
          <IonItem>
            <IonLabel>English</IonLabel>
            <IonRadio value="en" />
          </IonItem>

          <IonItem>
            <IonLabel>Lietuvių</IonLabel>
            <IonRadio value="lt_LT" />
          </IonItem>
        </IonRadioGroup>
      </IonList>
    </IonPage>
  );
}
SelectLanguage.propTypes = {
  onSelect: PropTypes.func.isRequired,
}

function SelectCountry({ onSelect }) {
  return (
    <IonPage id="language-country-select">
      <IonList>
        <div className="header">
          <IonIcon name="flag" size="large" />
          <h4>{t('Select your country')}</h4>
        </div>
        <IonRadioGroup onIonChange={onSelect}>
          <IonItem>
            <IonLabel>{t('United Kingdom')}</IonLabel>
            <IonRadio value="UK" />
          </IonItem>

          <IonItem>
            <IonLabel>{t('Lietuva')}</IonLabel>
            <IonRadio value="LT" />
          </IonItem>
        </IonRadioGroup>
      </IonList>
    </IonPage>
  );
}
SelectCountry.propTypes = {
  onSelect: PropTypes.func.isRequired,
}

const Component = observer(props => {
  if (!appModel.get('language')) {
    return (
      <SelectLanguage
        onSelect={e => {
          appModel.set('language', e.target.value);
        }}
      />
    );
  }

  if (!appModel.get('country')) {
    return (
      <SelectCountry
        onSelect={e => {
          appModel.set('country', e.target.value);
        }}
      />
    );
  }

  return props.children;
});

Component.propTypes = {};

export default Component;
