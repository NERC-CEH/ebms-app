import { useContext } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { globeOutline } from 'ionicons/icons';
import { Page, Main, Header, RadioInput } from '@flumens';
import { IonIcon, IonList, NavContext } from '@ionic/react';
import languages, { Language } from 'common/config/languages';
import appModel from 'models/app';

type Props = { hideHeader?: boolean };

function SelectLanguage({ hideHeader }: Props) {
  const { goBack } = useContext(NavContext);

  const currentValue = appModel.data.language;

  const isSettingsPage = !hideHeader;

  function onSelect(newLanguage: any) {
    appModel.data.language = newLanguage;
    appModel.save();

    if (isSettingsPage) goBack();
  }

  const alphabetically = (
    [, l1]: [string, Language],
    [, l2]: [string, Language]
  ) => l1.name.localeCompare(l2.name);
  const languageOption = ([value, language]: [string, Language]) => ({
    value,
    label: language.name,
  });

  const languagesOptions = Object.entries(languages)
    .sort(alphabetically)
    .map(languageOption);

  return (
    <Page
      id="language-select"
      className={clsx(hideHeader && 'pt-[var(--ion-safe-area-top,0)]')}
    >
      {!hideHeader && <Header title="Language" />}

      <Main>
        <IonList className="my-10!">
          {hideHeader && (
            <div className="mx-auto flex flex-col items-center text-primary-900">
              <IonIcon icon={globeOutline} className="size-10" />
              <h1>Select your language</h1>
            </div>
          )}
          <RadioInput
            onChange={onSelect}
            value={currentValue}
            options={languagesOptions}
            skipTranslation
            platform="ios"
            className="[&>div>label]:font-sans!" // use default browser font to support all languages
          />
        </IonList>
      </Main>
    </Page>
  );
}

export default observer(SelectLanguage);
