import { useContext, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import {
  getModelsFromRoute,
  useLoader,
  Main as MainContainer,
  useToast,
} from '@flumens';
import { NavContext } from '@ionic/react';
import samplesCollection from 'models/collections/samples';
import Sample from 'models/sample';
import { fetchRemoteSample } from 'models/sample/remoteExt';

export const withRemoteModels = (Component: any) => {
  return (props: any) => {
    const { goBack } = useContext(NavContext);
    const match = useRouteMatch<{ smpId: string }>();
    const loader = useLoader();
    const toast = useToast();

    const [models, setModels] = useState<any>({});

    useEffect(() => {
      (async () => {
        if (props.sample?.isPartial) {
          console.log('Fetching partial sample');

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
          await loader.show('Please wait...');
          console.log('Fetching sample first time');
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
    }, [props.sample]);

    const mergedModels = { ...props, ...models };
    if (!mergedModels.sample) return null;

    return <Component {...mergedModels} />;
  };
};

export const useFetchRemote = (sample: Sample) => {
  const [isIncompleteSample, setIsIncompleteSample] = useState(
    sample.isPartial
  );

  const loader = useLoader();
  useEffect(() => {
    (async () => {
      if (!isIncompleteSample) return;

      await loader.show('Please wait...');

      try {
        await sample.fetchRemote();
      } catch (error) {
        console.error(error);
      }

      loader.hide();

      setIsIncompleteSample(false);
    })();
  }, [isIncompleteSample]);

  return isIncompleteSample;
};

export const PartialLoadingMain = () => (
  <MainContainer>
    <div />
  </MainContainer>
);
