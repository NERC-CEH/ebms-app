import { FC, Fragment, useState } from 'react';
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
import { Page, Main, Header, useAlert } from '@flumens';
import { flagOutline } from 'ionicons/icons';
import appModel from 'models/app';
import { Trans as T, useTranslation } from 'react-i18next';
import countries from 'common/config/countries';
import './styles.scss';

type Props = {
  hideHeader?: boolean;
};

const SelectCountry: FC<Props> = ({ hideHeader }) => {
  const [secondRender, forceSecondRender] = useState(false);
  const alert = useAlert();
  const { t } = useTranslation();

  if (hideHeader) {
    const forceSecondRenderWrap = () => forceSecondRender(true);
    // This is an unkown issue where changing a language on the initial
    // app load screen does not update the countries labels so we force rerender
    // this screen after a timeout
    setTimeout(forceSecondRenderWrap, 10);

    if (!secondRender) {
      return null;
    }
  }

  const currentValue = appModel.attrs.country;

  function onSelect(e: any) {
    const newCountry = e.target.value;
    if (appModel.attrs.country !== 'UK' && newCountry === 'UK') {
      alert({
        header: 'Note',
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

  const translate = ([value, country]: any) => [value, t(country)];
  const placeElseWhereAtEnd = ([value1, country1]: any, [, country2]: any) =>
    value1 === 'ELSEWHERE' ? 1 : country1.localeCompare(country2);

  const getCountryOption = ([value, country]: any) => (
    <Fragment key={value}>
      {value === 'ELSEWHERE' && <IonItemDivider />}
      <IonItem>
        <IonLabel>{country}</IonLabel>
        <IonRadio value={value} />
      </IonItem>
    </Fragment>
  );
  const countriesOptions = Object.entries(countries)
    .map(translate)
    .sort(placeElseWhereAtEnd)
    .map(getCountryOption);

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
          <IonRadioGroup onIonChange={onSelect} value={currentValue}>
            {countriesOptions}
          </IonRadioGroup>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(SelectCountry);
