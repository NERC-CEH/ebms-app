import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  IonIcon,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonItemDivider,
} from '@ionic/react';
import Page from 'Lib/Page';
import Main from 'Lib/Main';
import alert from 'helpers/alert';
import { flag } from 'ionicons/icons';
import countries from 'common/config/countries';
import Header from 'Lib/Header';
import './styles.scss';

function SelectCountry({ appModel, hideHeader }) {
  const currentValue = appModel.attrs.country;

  function onSelect(e) {
    const newCountry = e.target.value;
    if (appModel.attrs.country !== 'UK' && newCountry === 'UK') {
      alert({
        header: t('Note'),
        message: `This app is not for the <b>Big Butterfly Count</b>. If you want to take part in that survey please visit <a href="https://www.bigbutterflycount.org">this website</a>.`,
        buttons: [
          {
            text: 'Got it',
            role: 'cancel',
            cssClass: 'primary',
          },
        ],
      });
    }
    appModel.attrs.country = newCountry; // eslint-disable-line no-param-reassign
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
    <Page id="country-select">
      {!hideHeader && <Header title={t('Country')} />}

      <Main>
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
      </Main>
    </Page>
  );
}

SelectCountry.propTypes = {
  appModel: PropTypes.object.isRequired,
  hideHeader: PropTypes.bool,
};

export default observer(SelectCountry);
