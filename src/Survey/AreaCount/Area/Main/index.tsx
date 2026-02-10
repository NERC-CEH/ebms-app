import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Main,
  MapContainer,
  MapDraw,
  useAlert,
  mapFlyToLocation,
  isValidLocation,
} from '@flumens';
import GeolocateButton from 'common/Components/GeolocateButton';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';
import Sample, { AreaCountLocation } from 'models/sample';
import FinishPointMarker from './FinishPointMarker';
import Records from './Records';
import StartingPointMarker from './StartingPointMarker';

const useDeletePrompt = () => {
  const alert = useAlert();

  return () =>
    new Promise((resolve: any) => {
      alert({
        header: 'Delete',
        message: 'Are you sure you want to delete your current track?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => resolve(false),
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => resolve(true),
          },
        ],
      });
    });
};

type Props = {
  sample: Sample;
  setLocation: any;
  isGPSTracking: boolean;
  isDisabled?: boolean;
};

const AreaAttr = ({
  sample,
  setLocation,
  isGPSTracking,
  isDisabled,
}: Props) => {
  const location = (sample.data.location as AreaCountLocation) || {};

  let initialViewState;
  if (isValidLocation(location)) {
    initialViewState = { ...location };
  } else {
    const country = countries[appModel.data.country!];
    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  const shouldDeleteShape = useDeletePrompt();

  const isFinished =
    sample.isDisabled || sample.metadata.saved || sample.isTimerFinished();

  const onShapeChange = async (newShape: any) => {
    if (!newShape) {
      const shouldDelete = await shouldDeleteShape();
      if (!shouldDelete) return false;
    }

    setLocation(newShape);
    return true;
  };

  const [mapRef, setMapRef] = useState<any>();
  const flyToLocation = () => {
    const locationToFly = { ...location };
    if (isGPSTracking) delete locationToFly?.shape;
    mapFlyToLocation(mapRef, locationToFly as any);
  };
  useEffect(flyToLocation, [mapRef, location]);

  return (
    <Main className="[--padding-bottom:0] [--padding-top:0]">
      <MapContainer
        onReady={ref => ref.resize() && setMapRef(ref)}
        accessToken={config.map.mapboxApiKey}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
        maxPitch={0}
        initialViewState={initialViewState}
        maxZoom={19}
      >
        <GeolocateButton />

        <MapDraw shape={location?.shape as any} onChange={onShapeChange}>
          {!isDisabled && !isGPSTracking && <MapDraw.Control line polygon />}

          <MapDraw.Context.Consumer>
            {({ isEditing }: any) =>
              !isEditing && (
                <>
                  <MapContainer.Marker {...location} />
                  <StartingPointMarker {...location} />
                  <FinishPointMarker {...location} active={!isFinished} />
                </>
              )
            }
          </MapDraw.Context.Consumer>
        </MapDraw>

        <Records sample={sample} />
      </MapContainer>
    </Main>
  );
};

export default observer(AreaAttr);
