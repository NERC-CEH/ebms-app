import { useContext } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { globeOutline } from 'ionicons/icons';
import { Page, Main, Header } from '@flumens';
import {
  IonIcon,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  NavContext,
} from '@ionic/react';
import languages, { Language } from 'common/config/languages';
import appModel from 'models/app';
import './styles.scss';

type Props = { hideHeader?: boolean };

function SelectLanguage({ hideHeader }: Props) {
  const { goBack } = useContext(NavContext);

  const currentValue = appModel.attrs.language;

  const isSettingsPage = !hideHeader;

  function onSelect(e: any) {
    appModel.attrs.language = e.target.value; // eslint-disable-line no-param-reassign
    appModel.save();

    if (isSettingsPage) goBack();
  }

  const alphabetically = (
    [, l1]: [string, Language],
    [, l2]: [string, Language]
  ) => l1.name.localeCompare(l2.name);
  const languageOption = ([value, language]: [string, Language]) => (
    <IonItem key={value}>
      <IonRadio value={value}>{language.name}</IonRadio>
    </IonItem>
  );
  const languagesOptions = Object.entries(languages)
    .sort(alphabetically)
    .map(languageOption);

  return (
    <Page
      id="language-select"
      className={clsx(hideHeader && 'safeAreaPadding')}
    >
      {!hideHeader && <Header title="Language" />}

      <Main>
        <IonList>
          {hideHeader && (
            <div className="header">
              <IonIcon icon={globeOutline} size="large" />
              <h4>Select your language</h4>
            </div>
          )}
          <IonRadioGroup onIonChange={onSelect} value={currentValue}>
            {languagesOptions}
          </IonRadioGroup>
        </IonList>
      </Main>
    </Page>
  );
}

export default observer(SelectLanguage);
