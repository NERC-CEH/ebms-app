import { FC } from 'react';
import Log from 'helpers/log';
import { Page, Header, useToast } from '@flumens';
import appModel, { Attrs } from 'models/app';
import userModel from 'models/user';
import { useTranslation } from 'react-i18next';
import savedSamples from 'models/collections/samples';
import locations from 'models/collections/locations';
import Main from './Main';

async function resetApp(toast: any) {
  Log('Settings:Menu:Controller: resetting the application!', 'w');
  try {
    await appModel.resetDefaults();
    await userModel.resetDefaults();
    await savedSamples.resetDefaults();
    await locations.resetDefaults();

    toast.success('Done');
  } catch (e: any) {
    toast.error(e);
  }
}

async function uploadAllSamples(toast: any, t: any) {
  Log('Settings:Menu:Controller: sending all samples.');

  if (!userModel.isLoggedIn()) {
    toast.warn('Please log in first to upload the records.');
    return;
  }

  try {
    const affectedRecordsCount = await savedSamples.remoteSaveAll();
    toast.success(
      t('Uploading {{count}} record', { count: affectedRecordsCount }),
      { skipTranslation: true }
    );
  } catch (e: any) {
    toast.error(e);
  }
}

const onToggle = (setting: keyof Attrs, checked: boolean) => {
  Log('Settings:Menu:Controller: setting toggled.');
  appModel.attrs[setting] = checked; // eslint-disable-line no-param-reassign
  appModel.save();
};

const Container: FC = () => {
  const toast = useToast();
  const { t } = useTranslation();

  const {
    useTraining,
    useExperiments,
    sendAnalytics,
    language,
    country,
    primarySurvey,
    speciesGroups,
    showCommonNamesInGuide,
  } = appModel.attrs;

  const resetAppWrap = () => resetApp(toast);
  const uploadAllSamplesWrap = () => uploadAllSamples(toast, t);

  return (
    <Page id="settings-menu">
      <Header title="Settings" />
      <Main
        useTraining={useTraining}
        useExperiments={useExperiments}
        sendAnalytics={sendAnalytics}
        primarySurvey={primarySurvey}
        showCommonNamesInGuide={showCommonNamesInGuide}
        uploadAllSamples={uploadAllSamplesWrap}
        resetApp={resetAppWrap}
        onToggle={onToggle}
        language={language || ''}
        speciesGroups={speciesGroups}
        country={country}
      />
    </Page>
  );
};

export default Container;
