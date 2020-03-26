import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonItemDivider,
} from '@ionic/react';
import { flag } from 'ionicons/icons';
import { countries } from 'helpers/translator';
import AppHeader from 'Components/Header';
import './styles.scss';

function SelectCountry({ appModel, hideHeader }) {
  const currentValue = appModel.attrs.country;

  function onSelect(e) {
    appModel.attrs.country = e.target.value;
    appModel.save();
  }

  const translate = ([value, country]) => [value, t(country)];
  const placeElseWhereAtEnd = ([value1, country1], [, country2]) =>
    value1 === 'ELSEWHERE' ? 1 : country1.localeCompare(country2);

  const countriesOptions = Object.entries(countries)
    .map(translate)
    .sort(placeElseWhereAtEnd)
    .map(([value, country]) => (
      <React.Fragment key={value}>
        {value === 'ELSEWHERE' && <IonItemDivider />}
        <IonItem>
          <IonLabel>{country}</IonLabel>
          <IonRadio value={value} checked={currentValue === value} />
        </IonItem>
      </React.Fragment>
    ));

  return (
    <IonPage id="country-select">
      {!hideHeader && <AppHeader title={t('Country')} />}

      <IonContent>
        <IonList>
          {hideHeader && (
            <div className="header">
              <IonIcon icon={flag} size="large" />
              <h4>{t('Select your country')}</h4>
            </div>
          )}
          <IonRadioGroup onIonChange={onSelect}>
            {countriesOptions}
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
}

SelectCountry.propTypes = {
  appModel: PropTypes.object.isRequired,
  hideHeader: PropTypes.bool,
};

export default observer(SelectCountry);
