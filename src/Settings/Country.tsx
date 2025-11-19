import { useState, useContext } from 'react';
import { observer } from 'mobx-react';
import { flagOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { Page, Main, Header, useAlert, RadioInput, Collapse } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import countries, {
  continents,
  ContinentCode,
  CountryCode,
} from 'common/config/countries';
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

  // group countries by continent
  const countriesByContinent = Object.entries(countries).reduce(
    (acc, [code, country]) => {
      const continent = country.continent || 'OTHER';
      if (!acc[continent]) acc[continent] = [];

      acc[continent].push({ code, name: t(country.name) });
      return acc;
    },
    {} as Record<string, Array<{ code: string; name: string }>>
  );

  // sort countries within each continent
  Object.values(countriesByContinent).forEach(countryList => {
    countryList.sort((a, b) => a.name.localeCompare(b.name));
  });

  // define continent order
  const continentOrder: ContinentCode[] = ['EU', 'AS', 'AF', 'AU', 'NA', 'SA'];

  // find the continent of the currently selected country
  const selectedCountryContinent =
    countries[currentValue as CountryCode]?.continent;

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
            platform="ios"
            skipTranslation
          >
            {continentOrder.map(continentCode => {
              const countryList = countriesByContinent[continentCode];
              if (!countryList) return null;

              const isSelectedContinent =
                selectedCountryContinent === continentCode;
              const collapseProps = isSelectedContinent && {
                groupProps: { value: continentCode },
                value: continentCode,
              };

              return (
                <div className="overflow-hidden rounded-md [&_ion-item]:[--border-style:none] [&_ion-label]:!text-base [&_ion-label]:!font-semibold">
                  <Collapse
                    key={continentCode}
                    title={continents[continentCode]}
                    {...collapseProps}
                  >
                    <div className="my-3 flex w-full flex-col gap-2">
                      {countryList.map(country => (
                        <RadioInput.Option
                          key={country.code}
                          value={country.code}
                          label={country.name}
                          className="w-full"
                        />
                      ))}
                    </div>
                  </Collapse>
                </div>
              );
            })}

            {countriesByContinent.OTHER && (
              <div className="mt-5">
                {countriesByContinent.OTHER.map(country => (
                  <RadioInput.Option
                    key={country.code}
                    value={country.code}
                    label={country.name}
                  />
                ))}
              </div>
            )}
          </RadioInput>
        </IonList>
      </Main>
    </Page>
  );
};

export default observer(SelectCountry);
