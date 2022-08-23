import { FC } from 'react';
import { observer } from 'mobx-react';
import {
  IonIcon,
  IonList,
  IonItemDivider,
  IonItem,
  IonLabel,
} from '@ionic/react';
import {
  warningOutline,
  arrowUndoOutline,
  flameOutline,
  schoolOutline,
  flagOutline,
  globeOutline,
  shareOutline,
  paperPlaneOutline,
  addCircleOutline,
  personRemoveOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import languages from 'common/config/languages';
import countries from 'common/config/countries';
import config from 'common/config';
import surveys from 'common/config/surveys';
import { Main, useAlert, InfoMessage, MenuAttrToggle } from '@flumens';
import butterflyIcon from 'common/images/butterfly.svg';
import mothIcon from 'common/images/moth.svg';
import './styles.scss';

function useUserDeleteDialog(deleteUser: any) {
  const alert = useAlert();

  const showUserDeleteDialog = () => {
    alert({
      header: 'Account delete',
      message: (
        <>
          Are you sure you want to delete your account?
          <InfoMessage
            color="danger"
            icon={warningOutline}
            className="destructive-warning"
          >
            This will remove your account on the{' '}
            <b>{{ url: config.backend.url }}</b> website. You will lose access
            to any records that you have previously submitted using the app or
            website.
          </InfoMessage>
        </>
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

function resetDialog(resetApp: any, alert: any) {
  alert({
    header: 'Reset',
    message: (
      <>
        <T>
          Are you sure you want to reset the application to its initial state?
        </T>
        <p>
          <b>
            <T>This will wipe all the locally stored app data!</T>
          </b>
        </p>
      </>
    ),
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Reset',
        cssClass: 'secondary',
        handler: resetApp,
      },
    ],
  });
}

function uploadAllSamplesDialog(uploadAllSamples: any, alert: any) {
  alert({
    header: 'Upload All',
    message: <T>Are you sure you want to upload all finished records?</T>,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: 'Upload',
        cssClass: 'secondary',
        handler: uploadAllSamples,
      },
    ],
  });
}

type Props = {
  resetApp: any;
  onToggle: any;
  uploadAllSamples: any;
  useTraining: boolean;
  useExperiments: boolean;
  sendAnalytics: boolean;
  showCommonNamesInGuide: boolean;
  isLoggedIn: boolean;
  deleteUser: any;
  primarySurvey?: string;
  language?: string;
  country?: string;
  speciesGroups?: any[];
};

const MenuMain: FC<Props> = ({
  resetApp,
  onToggle,
  isLoggedIn,
  deleteUser,
  uploadAllSamples,
  useTraining,
  useExperiments,
  sendAnalytics,
  primarySurvey,
  language,
  country,
  showCommonNamesInGuide,
  speciesGroups,
}) => {
  const alert = useAlert();
  const showUserDeleteDialog = useUserDeleteDialog(deleteUser);

  const primarySurveyLabel = surveys[primarySurvey as string].label;

  const onSendAnalyticsToggle = (checked: boolean) =>
    onToggle('sendAnalytics', checked);
  const onUseExperiments = (checked: boolean) =>
    onToggle('useExperiments', checked);
  const onShowCommonNamesInGuide = (checked: boolean) =>
    onToggle('showCommonNamesInGuide', checked);
  const onResetDialog = () => resetDialog(resetApp, alert);
  const onTrainingToggle = (checked: boolean) =>
    onToggle('useTraining', checked);
  const onSubmitAllDialog = () =>
    uploadAllSamplesDialog(uploadAllSamples, alert);

  const nonDayFlyingMoths = (group: any) => group !== 'day-flying-moths';
  const speciesGroupExcludedDayFlyingMothGroup =
    speciesGroups?.filter(nonDayFlyingMoths);

  return (
    <Main className="app-settings">
      <IonList lines="full">
        <IonItemDivider>
          <T>Surveying</T>
        </IonItemDivider>
        <div className="rounded">
          <IonItem id="submit-all-btn" onClick={onSubmitAllDialog}>
            <IonIcon icon={paperPlaneOutline} size="small" slot="start" />
            <IonLabel>
              <T>Upload All</T>
            </IonLabel>
          </IonItem>
          <InfoMessage color="medium">
            Batch upload all finished records. This does not include records in
            &#39;draft&#39; stage.
          </InfoMessage>
          <IonItem routerLink="/settings/primary-survey" detail>
            <IonLabel>
              <T>Primary Survey</T>
            </IonLabel>
            <IonIcon icon={addCircleOutline} size="small" slot="start" />
            <IonLabel slot="end">
              <T>{primarySurveyLabel}</T>
            </IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/species" detail>
            <IonLabel>
              <T>Species groups</T>
            </IonLabel>
            <IonIcon icon={butterflyIcon} size="small" slot="start" />
            <IonLabel slot="end">
              {speciesGroupExcludedDayFlyingMothGroup?.length}
            </IonLabel>
          </IonItem>

          <IonItem routerLink="/settings/moth-survey" detail>
            <IonLabel>
              <T>Moth Survey</T>
            </IonLabel>
            <IonIcon icon={mothIcon} size="small" slot="start" />
          </IonItem>
        </div>

        <IonItemDivider>
          <T>Application</T>
        </IonItemDivider>
        <div className="rounded">
          <IonItem routerLink="/settings/language" detail>
            <IonLabel>
              <T>Language</T>
            </IonLabel>
            <IonIcon icon={flagOutline} size="small" slot="start" />
            <IonLabel slot="end">
              {(languages as any)[language as any]}
            </IonLabel>
          </IonItem>
          <IonItem routerLink="/settings/country" detail>
            <IonLabel>
              <T>Country</T>
            </IonLabel>
            <IonIcon icon={globeOutline} size="small" slot="start" />
            <IonLabel slot="end">
              <T>{(countries as any)[country as any]}</T>
            </IonLabel>
          </IonItem>

          <MenuAttrToggle
            icon={butterflyIcon}
            label="Show common names in guide"
            value={showCommonNamesInGuide}
            onChange={onShowCommonNamesInGuide}
          />
          <MenuAttrToggle
            icon={schoolOutline}
            label="Training Mode"
            value={useTraining}
            onChange={onTrainingToggle}
          />
          <InfoMessage color="medium">
            Mark any new records as &#39;training&#39; and exclude from all
            reports.
          </InfoMessage>

          <MenuAttrToggle
            icon={flameOutline}
            label="Experimental Features"
            value={useExperiments}
            onChange={onUseExperiments}
          />

          <MenuAttrToggle
            icon={shareOutline}
            label="Share App Analytics"
            value={sendAnalytics}
            onChange={onSendAnalyticsToggle}
          />
          <InfoMessage color="medium">
            Share app crash data so we can make the app more reliable.
          </InfoMessage>
        </div>

        <div className="rounded destructive-item">
          <IonItem onClick={onResetDialog}>
            <IonIcon icon={arrowUndoOutline} size="small" slot="start" />
            <IonLabel>
              <T>Reset</T>
            </IonLabel>
          </IonItem>
          <InfoMessage color="medium">
            You can reset the app data to its default settings.
          </InfoMessage>

          {isLoggedIn && (
            <>
              <IonItem onClick={showUserDeleteDialog}>
                <IonIcon icon={personRemoveOutline} size="small" slot="start" />
                <IonLabel>
                  <T>Delete account</T>
                </IonLabel>
              </IonItem>
              <InfoMessage color="medium">
                You can delete your user account from the system.
              </InfoMessage>
            </>
          )}
        </div>
      </IonList>

      <p className="app-version">{`v${config.version} (${config.build})`}</p>
    </Main>
  );
};

export default observer(MenuMain);
