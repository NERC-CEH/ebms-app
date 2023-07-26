import { useContext, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { getModelsFromRoute, useLoader, useToast, device } from '@flumens';
import { NavContext } from '@ionic/react';
import userModel from 'common/models/user';
import samplesCollection from 'models/collections/samples';
import { fetchRemoteSample } from 'models/sample/remoteExt';

const withRemoteModels = (Component: any) => (props: any) => {
  const { navigate, goBack } = useContext(NavContext);
  const match = useRouteMatch<{ smpId: string }>();
  const loader = useLoader();
  const toast = useToast();

  const [models, setModels] = useState<any>({});

  const checkRemote = () => {
    (async () => {
      if (props.sample?.isPartial) {
        console.log('Fetching partial sample');

        if (!device.isOnline) {
          toast.warn(`Sorry, looks like you're offline.`);
          goBack();
          return;
        }

        if (!userModel.isLoggedIn()) {
          navigate(`/user/login`, 'none', 'replace');
          return;
        }

        await loader.show('Please wait...');

        try {
          await props.sample.fetchRemote();
        } catch (error) {
          console.error(error);
        }

        await loader.hide();
        return;
      }

      if (props.sample || models.sample) return;

      try {
        console.log('Fetching sample first time');

        await loader.show('Please wait...');

        const remoteSample = await fetchRemoteSample(match.params.smpId);
        samplesCollection.push(remoteSample); // cache
        const modelsFromRoute = getModelsFromRoute(samplesCollection, match);
        setModels(modelsFromRoute);
      } catch (error: any) {
        toast.error(error);
        goBack();
      }

      await loader.hide();
    })();
  };
  useEffect(checkRemote, [props.sample]);

  const mergedModels = { ...props, ...models };
  if (!mergedModels.sample) return null;

  return <Component {...mergedModels} />;
};

export default withRemoteModels;
