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
import { languages, countries } from 'helpers/translator';
import './styles.scss';

function SelectLanguage({ onSelect }) {
  const languagesOptions = Object.entries(languages).map(
    ([value, language]) => (
      <IonItem key={value}>
        <IonLabel>{language}</IonLabel>
        <IonRadio value={value} />
      </IonItem>
    )
  );

  return (
    <IonPage id="language-country-select">
      <IonList>
        <div className="header">
          <IonIcon name="globe" size="large" />
          <h4>Select your language</h4>
        </div>
        <IonRadioGroup onIonChange={onSelect}>{languagesOptions}</IonRadioGroup>
      </IonList>
    </IonPage>
  );
}
SelectLanguage.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

function SelectCountry({ onSelect }) {
  const countriesOptions = Object.entries(countries).map(([value, country]) => (
    <IonItem key={value}>
      <IonLabel>{t(country)}</IonLabel>
      <IonRadio value={value} />
    </IonItem>
  ));

  return (
    <IonPage id="language-country-select">
      <IonList>
        <div className="header">
          <IonIcon name="flag" size="large" />
          <h4>{t('Select your country')}</h4>
        </div>
        <IonRadioGroup onIonChange={onSelect}>{countriesOptions}</IonRadioGroup>
      </IonList>
    </IonPage>
  );
}
SelectCountry.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

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
