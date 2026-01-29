import { observer } from 'mobx-react';
import {
  warningOutline,
  flameOutline,
  schoolOutline,
  flagOutline,
  globeOutline,
  shareOutline,
  addCircleOutline,
  personRemoveOutline,
  trashBinOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main, useAlert, InfoMessage, Toggle } from '@flumens';
import { IonIcon, IonList, IonItem, IonLabel, isPlatform } from '@ionic/react';
import config from 'common/config';
import countries, { CountryCode } from 'common/config/countries';
import languages, { LanguageCode } from 'common/config/languages';
import butterflyIcon from 'common/images/butterfly.svg';
import mothIcon from 'common/images/moth.svg';
import { surveyConfigs as surveys } from 'models/sample';

function useDatabaseExportDialog(exportFn: any) {
  const alert = useAlert();

  const showDatabaseExportDialog = () => {
    alert({
      header: 'Export',
      message: (
        <T>
          Are you sure you want to export the data?
          <p className="my-2 font-bold">
            This feature is intended solely for technical support and is not a
            supported method for exporting your data
          </p>
        </T>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Export',
          handler: exportFn,
        },
      ],
    });
  };

  return showDatabaseExportDialog;
}

function useUserDeleteDialog(deleteUser: any) {
  const alert = useAlert();

  const showUserDeleteDialog = () => {
    alert({
      header: 'Account delete',
      message: (
        <T>
          Are you sure you want to delete your account?
          <InfoMessage
            color="danger"
            prefix={<IonIcon src={warningOutline} />}
            skipTranslation
          >
            This will remove your account on the{' '}
            <b>{{ url: config.backend.url } as any}</b> website. You will lose
            access to any records that you have previously submitted using the
            app or website.
          </InfoMessage>
        </T>
      ),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: deleteUser,
        },
      ],
    });
  };

  return showUserDeleteDialog;
}

function clearCacheDialog(resetApp: any, alert: any) {
  alert({
    header: 'Clear cache',
    message: ' This will delete cached data, including your uploaded surveys.',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Clear',
        role: 'destructive',
        handler: resetApp,
      },
    ],
  });
}

type Props = {
  clearCache: any;
  onToggle: any;
  useTraining: boolean;
  useExperiments: boolean;
  sendAnalytics: boolean;
  showCommonNamesInGuide: boolean;
  isLoggedIn: boolean;
  deleteUser: any;
  primarySurvey?: string;
  language: LanguageCode;
  country: CountryCode;
  exportDatabase: any;
  importDatabase: any;
};

const MenuMain = ({
  clearCache,
  onToggle,
  isLoggedIn,
  deleteUser,
  useTraining,
  useExperiments,
  sendAnalytics,
  primarySurvey,
  language,
  country,
  showCommonNamesInGuide,
  exportDatabase,
  importDatabase,
}: Props) => {
  const showDatabaseExportDialog = useDatabaseExportDialog(exportDatabase);

  const alert = useAlert();
  const showUserDeleteDialog = useUserDeleteDialog(deleteUser);

  const primarySurveyLabel = surveys[primarySurvey as string].label;

  const onSendAnalyticsToggle = (checked: boolean) =>
    onToggle('sendAnalytics', checked);
  const onUseExperiments = (checked: boolean) =>
    onToggle('useExperiments', checked);
  const onShowCommonNamesInGuide = (checked: boolean) =>
    onToggle('showCommonNamesInGuide', checked);
  const onClearCacheDialog = () => clearCacheDialog(clearCache, alert);
  const onTrainingToggle = (checked: boolean) =>
    onToggle('useTraining', checked);

  const countryLabel = countries[country]?.name;
  const languageLabel = languages[language]?.name;

  return (
    <Main className="app-settings">
      <IonList lines="full">
        <h3 className="list-title">
          <T>Surveying</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/species-lists" detail>
            <IonLabel>
              <T>Species Lists</T>
            </IonLabel>
            <IonIcon icon={butterflyIcon} size="small" slot="start" />
          </IonItem>
          <IonItem routerLink="/settings/primary-survey" detail>
            <IonLabel>
              <T>Primary Survey</T>
            </IonLabel>
            <IonIcon icon={addCircleOutline} size="small" slot="start" />
            <IonLabel slot="end">
              <T>{primarySurveyLabel}</T>
            </IonLabel>
          </IonItem>

          <IonItem routerLink="/settings/moth-survey" detail>
            <IonLabel>
              <T>Moth Survey</T>
            </IonLabel>
            <IonIcon icon={mothIcon} size="small" slot="start" />
          </IonItem>
        </div>

        <h3 className="list-title">
          <T>Application</T>
        </h3>
        <div className="rounded-list">
          <IonItem routerLink="/settings/language" detail>
            <IonLabel>
              <T>Language</T>
            </IonLabel>
            <IonIcon icon={flagOutline} size="small" slot="start" />
            <IonLabel slot="end">{languageLabel}</IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/country" detail>
            <IonLabel>
              <T>Country</T>
            </IonLabel>
            <IonIcon icon={globeOutline} size="small" slot="start" />
            <IonLabel slot="end">
              <T>{countryLabel}</T>
            </IonLabel>
          </IonItem>
          <Toggle
            prefix={<IonIcon src={butterflyIcon} className="size-6" />}
            label="Show common names in guide"
            defaultSelected={showCommonNamesInGuide}
            onChange={onShowCommonNamesInGuide}
          />
          <Toggle
            prefix={<IonIcon src={schoolOutline} className="size-6" />}
            label="Training Mode"
            defaultSelected={useTraining}
            onChange={onTrainingToggle}
          />
          <InfoMessage inline>
            Mark any new records as &#39;training&#39; and exclude from all
            reports.
          </InfoMessage>
          <Toggle
            prefix={<IonIcon src={flameOutline} className="size-6" />}
            label="Experimental Features"
            defaultSelected={useExperiments}
            onChange={onUseExperiments}
          />
          <Toggle
            prefix={<IonIcon src={shareOutline} className="size-6" />}
            label="Share App Analytics"
            defaultSelected={sendAnalytics}
            onChange={onSendAnalyticsToggle}
          />
          <InfoMessage inline>
            Share app crash data so we can make the app more reliable.
          </InfoMessage>
          <IonItem onClick={onClearCacheDialog}>
            <IonIcon icon={trashBinOutline} size="small" slot="start" />
            <IonLabel>
              <T>Clear cache</T>
            </IonLabel>
          </IonItem>
          <InfoMessage inline>
            You can free up storage used by the app.
          </InfoMessage>
          <IonItem onClick={showDatabaseExportDialog}>
            <IonIcon icon={cloudDownloadOutline} size="small" slot="start" />
            <T>Export database</T>
          </IonItem>

          {!isPlatform('hybrid') && (
            <IonItem onClick={importDatabase}>
              <IonIcon icon={cloudUploadOutline} size="small" slot="start" />
              Import database
            </IonItem>
          )}
        </div>

        {isLoggedIn && (
          <>
            <h3 className="list-title">
              <T>Account</T>
            </h3>
            <div className="rounded-list">
              <IonItem onClick={showUserDeleteDialog} className="!text-danger">
                <IonIcon icon={personRemoveOutline} size="small" slot="start" />
                <IonLabel>
                  <T>Delete account</T>
                </IonLabel>
              </IonItem>
              <InfoMessage inline>
                You can delete your user account from the system.
              </InfoMessage>
            </div>
          </>
        )}
      </IonList>

      <p className="m-0 mx-auto w-full max-w-2xl p-2.5 text-right opacity-60">{`v${config.version} (${config.build})`}</p>
    </Main>
  );
};

export default observer(MenuMain);
