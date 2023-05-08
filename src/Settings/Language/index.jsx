import { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Page, Main, Header } from '@flumens';
import {
  IonIcon,
  IonList,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  NavContext,
} from '@ionic/react';
import { globeOutline } from 'ionicons/icons';
import languages from 'common/config/languages';
import './styles.scss';

function SelectLanguage({ appModel, hideHeader }) {
  const { goBack } = useContext(NavContext);

  const currentValue = appModel.attrs.language;

  const isSettingsPage = !hideHeader;

  function onSelect(e) {
    appModel.attrs.language = e.target.value; // eslint-disable-line no-param-reassign
    appModel.save();

    if (isSettingsPage) goBack();
  }

  const alphabetically = ([, l1], [, l2]) => l1.localeCompare(l2);
  const languageOption = ([value, language]) => (
    <IonItem key={value}>
      <IonLabel>{language}</IonLabel>
      <IonRadio value={value} checked={currentValue === value} />
    </IonItem>
  );
  const languagesOptions = Object.entries(languages)
    .sort(alphabetically)
    .map(languageOption);

  return (
    <Page id="language-select" className={hideHeader && 'safeAreaPadding'}>
      {!hideHeader && <Header title="Language" />}

      <Main>
        <IonList>
          {hideHeader && (
            <div className="header">
              <IonIcon icon={globeOutline} size="large" />
              <h4>Select your language</h4>
            </div>
          )}
          <IonRadioGroup onIonChange={onSelect}>
            {languagesOptions}
          </IonRadioGroup>
        </IonList>
      </Main>
    </Page>
  );
}

SelectLanguage.propTypes = {
  appModel: PropTypes.object.isRequired,
  hideHeader: PropTypes.bool,
};

export default observer(SelectLanguage);
