import React, { useState } from 'react';
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
import { Page, Main, Header, alert } from '@apps';
import { flagOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import countries from 'common/config/countries';
import './styles.scss';

function SelectCountry({ appModel, hideHeader }) {
  const [secondRender, forceSecondRender] = useState(false);
  
  if (hideHeader) {
    // This is an unkown issue where changing a language on the initial
    // app load screen does not update the countries labels so we force rerender
    // this screen after a timeout
    setTimeout(() => forceSecondRender(true), 10);

    if (!secondRender) {
      return null;
    }
  }

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
      {!hideHeader && <Header title="Country" />}

      <Main>
        <IonList>
          {hideHeader && (
            <div className="header">
              <IonIcon icon={flagOutline} size="large" />
              <h4>
                <T>Select your country</T>
              </h4>
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
