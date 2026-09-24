/* eslint-disable prefer-arrow-callback */
import { useContext } from 'react';
import writeBlob from 'capacitor-blob-writer';
import i18n from 'i18next';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Page, Header, useToast, useLoader } from '@flumens';
import { isPlatform, NavContext } from '@ionic/react';
import CONFIG from 'common/config';
import { db } from 'common/models/store';
import appModel, { Data, TaxonNameDisplayType } from 'models/app';
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

    await loader.show('common.pleaseWait');

    try {
      await userModel.delete();
      goBack();
      toast.success('common.done');
    } catch (error) {
      toast.error(error as Error);
    }

    loader.hide();
  };

  return deleteUser;
};

async function clearCache(toast: ReturnType<typeof useToast>) {
  console.log('Settings:Menu:Controller: clearing cache!');
  try {
    const clearSample = (smp: Sample) => {
      if (!smp.isStored) return null;
      if (!smp.isDisabled) return null;

      return smp.destroy();
    };
    await Promise.all(samplesCollection.map(clearSample));

    toast.success('common.done');
  } catch (error) {
    toast.error(error as Error);
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
  await Share.share({
    title: i18n.t('settings.export.shareTitle'),
    files: [url],
  });
  await Filesystem.deleteFile({ directory, path });
};

// For dev purposes only
const importDatabase = async () => {
  const blob = await new Promise<Blob>(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function () {
      const fileReader = new FileReader();
      fileReader.onloadend = async ({ target }: ProgressEvent<FileReader>) =>
        resolve(
          new Blob([target?.result || ''], {
            type: 'application/vnd.sqlite3',
          })
        );
      fileReader.readAsArrayBuffer(input.files![0]);
    });
    input.click();
  });

  await db.sqliteConnection.closeAllConnections();
  await db.import(blob);
  window.location.reload();
};

type BooleanKeys<T> = keyof {
  [K in keyof T as NonNullable<T[K]> extends boolean ? K : never]: T[K];
};

const onToggle = (setting: BooleanKeys<Data>, checked: boolean) => {
  console.log('Settings:Menu:Controller: setting toggled.');
  Object.assign(appModel.data, { [setting]: checked });
  appModel.save();

  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
};

const Container = () => {
  const toast = useToast();

  const deleteUser = useDeleteUser();

  const clearCacheWrap = () => clearCache(toast);

  const onTaxonNameDisplayChange = (value: TaxonNameDisplayType) => {
    appModel.data.taxonNameDisplay = value;
    appModel.save();
  };

  return (
    <Page id="settings-menu">
      <Header title="settings.title" />
      <Main
        isLoggedIn={userModel.isLoggedIn()}
        deleteUser={deleteUser}
        useTraining={appModel.data.useTraining}
        useExperiments={appModel.data.useExperiments}
        sendAnalytics={appModel.data.sendAnalytics}
        clearCache={clearCacheWrap}
        onToggle={onToggle}
        language={appModel.data.language!}
        country={appModel.data.country!}
        exportDatabase={exportDatabase}
        importDatabase={importDatabase}
        taxonNameDisplay={appModel.data.taxonNameDisplay}
        onTaxonNameDisplayChange={onTaxonNameDisplayChange}
      />
    </Page>
  );
};

export default Container;
