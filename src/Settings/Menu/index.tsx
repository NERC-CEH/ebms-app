import { FC, useContext } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Page, Header, useToast, useLoader } from '@flumens';
import { isPlatform, NavContext } from '@ionic/react';
import appModel, { Attrs } from 'models/app';
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
      if (smp.isCached()) return null;
      if (!smp.isDisabled()) return null;

      return smp.destroy();
    };
    await Promise.all(samplesCollection.map(clearSample));

    toast.success('Done');
  } catch (e: any) {
    toast.error(e);
  }
}

const onToggle = (setting: keyof Attrs, checked: boolean) => {
  console.log('Settings:Menu:Controller: setting toggled.');
  appModel.attrs[setting] = checked; // eslint-disable-line no-param-reassign
  appModel.save();

  isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
};

const Container: FC = () => {
  const toast = useToast();

  const deleteUser = useDeleteUser();

  const clearCacheWrap = () => clearCache(toast);

  return (
    <Page id="settings-menu">
      <Header title="Settings" />
      <Main
        isLoggedIn={userModel.isLoggedIn()}
        deleteUser={deleteUser}
        useTraining={appModel.attrs.useTraining}
        useExperiments={appModel.attrs.useExperiments}
        sendAnalytics={appModel.attrs.sendAnalytics}
        primarySurvey={appModel.attrs.primarySurvey}
        showCommonNamesInGuide={appModel.attrs.showCommonNamesInGuide}
        clearCache={clearCacheWrap}
        onToggle={onToggle}
        language={appModel.attrs.language!}
        country={appModel.attrs.country!}
        useGlobalSpeciesList={appModel.attrs.useGlobalSpeciesList}
      />
    </Page>
  );
};

export default Container;
