import { useState, useContext } from 'react';
import { observer } from 'mobx-react';
import { flagOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { Page, Main, Header, useAlert, RadioInput } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import countries, { Country } from 'common/config/countries';
import speciesListsCollection from 'common/models/collections/speciesLists';
import appModel from 'models/app';

type Props = {
  hideHeader?: any;
};

const fetchCountrySpeciesList = async (newCountry: string) => {
  if (newCountry === 'ELSEWHERE') return;

  try {
    const newCountryNormalised =
      newCountry === 'UK' ? 'GB' : newCountry.replace('_', ': ');
    const lists = await speciesListsCollection.fetchRemote({
      locationCode: newCountryNormalised,
    });

    if (lists.length !== 1)
      throw new Error('No default country species list found');

    const [list] = lists;

    if (!speciesListsCollection.cidMap.has(list.cid))
      speciesListsCollection.push(list);

    await list.save(true);
    await list.fetchRemoteSpecies();
  } catch (error) {
    console.error(
      'Error fetching country species list for ',
      newCountry,
      error
    );
  }
};

const SelectCountry = ({ hideHeader }: Props) => {
  const [secondRender, forceSecondRender] = useState(false);
  const alert = useAlert();
  const { t } = useTranslation();
  const { goBack } = useContext(NavContext);

  const isOnboarding = hideHeader;

  if (hideHeader) {
    const forceSecondRenderWrap = () => forceSecondRender(true);
    // This is an unkown issue where changing a language on the initial
    // app load screen does not update the countries labels so we force rerender
    // this screen after a timeout
    setTimeout(forceSecondRenderWrap, 10);
    if (!secondRender) return null;
  }

  const currentValue = appModel.data.country;

  async function onSelect(newCountry: any) {
    if (appModel.data.country !== 'UK' && newCountry === 'UK') {
      alert({
        header: 'Note',
        message: (
          <>
            This app is not for the <b>Big Butterfly Count</b>. If you want to
            take part in that survey please visit{' '}
            <a href="https://www.bigbutterflycount.org">this website</a>.
          </>
        ),
        buttons: [
          {
            text: 'Got it',
            role: 'cancel',
            cssClass: 'primary',
          },
        ],
      });
    }
    appModel.data.country = newCountry; // eslint-disable-line no-param-reassign
    appModel.save();

    // in the background, fetch species lists for the selected country
    fetchCountrySpeciesList(newCountry);

    if (!isOnboarding) goBack();
  }

  const translate = ([value, country]: [string, Country]): [string, string] => [
    value,
    t(country.name),
  ];
  const placeElseWhereAtEnd = (
    [value1, country1]: [string, string],
    [, country2]: [string, string]
  ) => (value1 === 'ELSEWHERE' ? 1 : country1.localeCompare(country2));

  const getCountryOption = ([value, country]: [string, string]) => ({
    className: value === 'ELSEWHERE' ? 'mt-5' : '',
    value,
    label: country,
  });

  const countriesOptions = Object.entries(countries)
    .map(translate)
    .sort(placeElseWhereAtEnd)
    .map(getCountryOption);

  return (
    <Page
      id="country-select"
      className={hideHeader && 'pt-[var(--ion-safe-area-top,0)]'}
    >
      {!hideHeader && <Header title="Country" />}

      <Main>
        <IonList>
          {hideHeader && (
            <div className="mx-auto my-10 flex flex-col items-center text-primary-900">
              <IonIcon icon={flagOutline} className="size-10" />
              <h1>
                <T>Select your country</T>
              </h1>
            </div>
          )}
          <RadioInput
            onChange={onSelect}
            value={currentValue}
            options={countriesOptions}
            platform="ios"
            skipTranslation
          />
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(SelectCountry);
