/* eslint-disable prefer-arrow-callback */
import { useContext } from 'react';
import writeBlob from 'capacitor-blob-writer';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Page, Header, useToast, useLoader } from '@flumens';
import { isPlatform, NavContext } from '@ionic/react';
import CONFIG from 'common/config';
import { db } from 'common/models/store';
import appModel, { Data } from 'models/app';
import samplesCollection from 'models/collections/samples';
import Sample from 'models/sample';
import userModel from 'models/user';
import Main from './Main';

const useDeleteUser = () => {
  const toast = useToast();
  const loader = useLoader();
  const { goBack } = useContext(NavContext);

  const deleteUser = async () => {
    console.log('Settings:Menu:Controller: deleting the user!');

    await loader.show('Please wait...');

    try {
      await userModel.delete();
      goBack();
      toast.success('Done');
    } catch (err: any) {
      toast.error(err);
    }

    loader.hide();
  };

  return deleteUser;
};

async function clearCache(toast: any) {
  console.log('Settings:Menu:Controller: clearing cache!');
  try {
    const clearSample = (smp: Sample) => {
      if (!smp.isStored) return null;
      if (!smp.isDisabled) return null;

      return smp.destroy();
    };
    await Promise.all(samplesCollection.map(clearSample));

    toast.success('Done');
  } catch (e: any) {
    toast.error(e);
  }
}

const exportDatabase = async () => {
  const blob = await db.export();

  if (!isPlatform('hybrid')) {
    window.open(window.URL.createObjectURL(blob), '_blank');
    return;
  }

  const path = `export-app-${CONFIG.build}-${Date.now()}.db`;
  const directory = Directory.External;

  await writeBlob({ path, directory, blob });
  const { uri: url } = await Filesystem.getUri({ directory, path });
  await Share.share({ title: `App database`, files: [url] });
  await Filesystem.deleteFile({ directory, path });
};

// For dev purposes only
const importDatabase = async () => {
  const blob = await new Promise<Blob>(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function () {
      const fileReader = new FileReader();
      fileReader.onloadend = async (e: any) =>
        resolve(
          new Blob([e.target.result], { type: 'application/vnd.sqlite3' })
        );
      fileReader.readAsArrayBuffer(input.files![0]);
    });
    input.click();
  });

  await db.sqliteConnection.closeAllConnections();
  await db.import(blob);
  window.location.reload();
};

const onToggle = (setting: keyof Data, checked: boolean) => {
  console.log('Settings:Menu:Controller: setting toggled.');
  appModel.data[setting] = checked; // eslint-disable-line no-param-reassign
  appModel.save();

  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
};

const Container = () => {
  const toast = useToast();

  const deleteUser = useDeleteUser();

  const clearCacheWrap = () => clearCache(toast);

  return (
    <Page id="settings-menu">
      <Header title="Settings" />
      <Main
        isLoggedIn={userModel.isLoggedIn()}
        deleteUser={deleteUser}
        useTraining={appModel.data.useTraining}
        useExperiments={appModel.data.useExperiments}
        sendAnalytics={appModel.data.sendAnalytics}
        primarySurvey={appModel.data.primarySurvey}
        showCommonNamesInGuide={appModel.data.showCommonNamesInGuide}
        clearCache={clearCacheWrap}
        onToggle={onToggle}
        language={appModel.data.language!}
        country={appModel.data.country!}
        exportDatabase={exportDatabase}
        importDatabase={importDatabase}
      />
    </Page>
  );
};

export default Container;
