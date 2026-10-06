import { observer } from 'mobx-react';
import {
  warningOutline,
  flameOutline,
  schoolOutline,
  globeOutline,
  shareOutline,
  personRemoveOutline,
  trashBinOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
  textOutline,
  languageOutline,
  refreshOutline,
  locationOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, useAlert, InfoMessage, Toggle, SelectInput } from '@flumens';
import { IonIcon, IonList, IonItem, IonLabel, isPlatform } from '@ionic/react';
import config from 'common/config';
import countries, { CountryCode } from 'common/config/countries';
import languages, { LanguageCode } from 'common/config/languages';
import butterflyIcon from 'common/images/butterfly.svg';
import mothIcon from 'common/images/moth.svg';
import type { TaxonNameDisplayType } from 'models/app';

function useDatabaseExportDialog(exportFn: () => void) {
  const alert = useAlert();

  const showDatabaseExportDialog = () => {
    alert({
      header: 'common.export',
      message: (
        <>
          <T>settings.export.confirm</T>
          <p className="my-2 font-bold">
            <T>settings.export.warning</T>
          </p>
        </>
      ),
      buttons: [
        {
          text: 'common.cancel',
          role: 'cancel',
        },
        {
          text: 'common.export',
          handler: exportFn,
        },
      ],
    });
  };

  return showDatabaseExportDialog;
}

function useUserDeleteDialog(deleteUser: () => void) {
  const alert = useAlert();

  const showUserDeleteDialog = () => {
    alert({
      header: 'settings.account.title',
      message: (
        <>
          <T>settings.account.confirm</T>
          <InfoMessage
            color="danger"
            prefix={<IonIcon src={warningOutline} />}
            skipTranslation
          >
            <T
              i18nKey="settings.account.warning"
              values={{ url: config.backend.url }}
              components={{ website: <b /> }}
            />
          </InfoMessage>
        </>
      ),
      buttons: [
        {
          text: 'common.cancel',
          role: 'cancel',
        },
        {
          text: 'common.delete',
          role: 'destructive',
          handler: deleteUser,
        },
      ],
    });
  };

  return showUserDeleteDialog;
}

function clearCacheDialog(
  resetApp: () => void,
  alert: ReturnType<typeof useAlert>
) {
  alert({
    header: 'settings.cache.label',
    message: 'settings.cache.confirm',
    buttons: [
      {
        text: 'common.cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'common.clear',
        role: 'destructive',
        handler: resetApp,
      },
    ],
  });
}

type BooleanSetting =
  'sendAnalytics' | 'useExperiments' | 'showContinueSurveyPrompt';

type Props = {
  clearCache: () => void;
  onToggle: (setting: BooleanSetting, checked: boolean) => void;
  useTraining: boolean;
  onTrainingToggle: (checked: boolean) => void;
  showContinueSurveyPrompt: boolean;
  useExperiments: boolean;
  sendAnalytics: boolean;
  isLoggedIn: boolean;
  deleteUser: () => void;
  language: LanguageCode;
  country: CountryCode;
  exportDatabase: () => void;
  importDatabase: () => void;
  taxonNameDisplay: TaxonNameDisplayType;
  onTaxonNameDisplayChange: (value: TaxonNameDisplayType) => void;
};

const MenuMain = ({
  clearCache,
  onToggle,
  isLoggedIn,
  deleteUser,
  useTraining,
  onTrainingToggle,
  showContinueSurveyPrompt,
  useExperiments,
  sendAnalytics,
  language,
  country,
  exportDatabase,
  importDatabase,
  taxonNameDisplay,
  onTaxonNameDisplayChange,
}: Props) => {
  const showDatabaseExportDialog = useDatabaseExportDialog(exportDatabase);

  const alert = useAlert();
  const showUserDeleteDialog = useUserDeleteDialog(deleteUser);

  const onSendAnalyticsToggle = (checked: boolean) =>
    onToggle('sendAnalytics', checked);
  const onUseExperiments = (checked: boolean) =>
    onToggle('useExperiments', checked);
  const onClearCacheDialog = () => clearCacheDialog(clearCache, alert);

  const countryLabel = countries[country]?.name;
  const languageLabel = languages[language]?.name;

  const taxonNameDisplayOptions = [
    {
      value: 'commonScientific',
      label: 'settings.names.both',
    },
    {
      value: 'commonOnly',
      label: 'settings.names.common',
    },
    {
      value: 'scientificOnly',
      label: 'settings.names.scientific',
    },
  ];

  return (
    <Main className="[--padding-bottom:20px]">
      <IonList lines="full">
        <h3 className="list-title">
          <T>settings.surveying</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/species-lists" detail>
            <IonLabel>
              <T>common.speciesLists</T>
            </IonLabel>
            <IonIcon icon={butterflyIcon} size="small" slot="start" />
          </IonItem>
          <IonItem routerLink="/settings/moth-survey" detail>
            <IonLabel>
              <T>settings.mothSurvey</T>
            </IonLabel>
            <IonIcon icon={mothIcon} size="small" slot="start" />
          </IonItem>
          <Toggle
            prefix={<IonIcon icon={refreshOutline} className="size-6" />}
            label="settings.autoStartAreaCounts.label"
            isSelected={showContinueSurveyPrompt}
            onChange={checked => onToggle('showContinueSurveyPrompt', checked)}
          />
          <InfoMessage inline>settings.autoStartAreaCounts.info</InfoMessage>
          <SelectInput
            prefix={<IonIcon icon={textOutline} className="size-6" />}
            label="settings.names.label"
            value={taxonNameDisplay}
            onChange={onTaxonNameDisplayChange}
            options={taxonNameDisplayOptions}
          />
          {isLoggedIn && (
            <IonItem routerLink="/locations/sites" detail>
              <IonLabel>
                <T>common.sites</T>
              </IonLabel>
              <IonIcon icon={locationOutline} size="small" slot="start" />
            </IonItem>
          )}
        </div>

        <h3 className="list-title">
          <T>common.application</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/language" detail>
            <IonLabel>
              <T>common.language</T>
            </IonLabel>
            <IonIcon icon={languageOutline} size="small" slot="start" />
            <IonLabel slot="end">{languageLabel}</IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/country" detail>
            <IonLabel>
              <T>common.country</T>
            </IonLabel>
            <IonIcon icon={globeOutline} size="small" slot="start" />
            <IonLabel slot="end">
              <T i18nKey={countryLabel as never} />
            </IonLabel>
          </IonItem>

          <Toggle
            prefix={<IonIcon src={schoolOutline} className="size-6" />}
            label="settings.training.label"
            isSelected={useTraining}
            isDisabled={!isLoggedIn}
            onChange={onTrainingToggle}
          />
          <InfoMessage inline>settings.training.info</InfoMessage>
          <Toggle
            prefix={<IonIcon src={flameOutline} className="size-6" />}
            label="settings.experimental"
            defaultSelected={useExperiments}
            onChange={onUseExperiments}
          />
          <Toggle
            prefix={<IonIcon src={shareOutline} className="size-6" />}
            label="settings.analytics.label"
            defaultSelected={sendAnalytics}
            onChange={onSendAnalyticsToggle}
          />
          <InfoMessage inline>settings.analytics.info</InfoMessage>
          <IonItem onClick={onClearCacheDialog}>
            <IonIcon icon={trashBinOutline} size="small" slot="start" />
            <IonLabel>
              <T>settings.cache.label</T>
            </IonLabel>
          </IonItem>
          <InfoMessage inline>settings.cache.info</InfoMessage>
          <IonItem onClick={showDatabaseExportDialog}>
            <IonIcon icon={cloudDownloadOutline} size="small" slot="start" />
            <T>settings.export.label</T>
          </IonItem>

          {!isPlatform('hybrid') && (
            <IonItem onClick={importDatabase}>
              <IonIcon icon={cloudUploadOutline} size="small" slot="start" />
              <T>settings.import</T>
            </IonItem>
          )}
        </div>

        {isLoggedIn && (
          <>
            <h3 className="list-title">
              <T>common.account</T>
            </h3>
            <div className="rounded-list">
              <IonItem onClick={showUserDeleteDialog} className="!text-danger">
                <IonIcon icon={personRemoveOutline} size="small" slot="start" />
                <IonLabel>
                  <T>settings.account.delete</T>
                </IonLabel>
              </IonItem>
              <InfoMessage inline>settings.account.info</InfoMessage>
            </div>
          </>
        )}
      </IonList>

      <p className="m-0 mx-auto w-full max-w-2xl p-2.5 text-right opacity-60">{`v${config.version} (${config.build})`}</p>
    </Main>
  );
};

export default observer(MenuMain);
