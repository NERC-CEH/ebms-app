import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import { Polygon } from 'geojson';
import { Main, MapContainer, MapDraw, mapFlyToShape } from '@flumens';
import config from 'common/config';
import countries from 'common/config/countries';
import appModel from 'common/models/app';

export type Shape = Polygon;

const getShapeCentroid = (shape?: Shape) => {
  if (!shape) return null;
  const [firstRing] = shape.coordinates as any;
  const [firstPoint] = firstRing;
  return { longitude: firstPoint[0], latitude: firstPoint[1] };
};

type Props = {
  onChange: (shape?: Shape) => void;
  shape?: Shape;
};

const AreaDraw = ({ shape, onChange }: Props) => {
  let initialViewState = {};
  if (shape) {
    initialViewState = getShapeCentroid(shape)!;
  } else {
    const country = countries[appModel.data.country!];
    if (country?.zoom) {
      initialViewState = { ...country };
    }
  }

  const [mapRef, setMapRef] = useState<any>();
  const flyToLocation = () => {
    mapFlyToShape(mapRef, shape);
  };
  useEffect(flyToLocation, [mapRef, shape]);

  return (
    <Main className="[--padding-bottom:0] [--padding-top:0]">
      <MapContainer
        onReady={setMapRef}
        accessToken={config.map.mapboxApiKey}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v10"
        maxPitch={0}
        initialViewState={initialViewState}
        maxZoom={19}
      >
        <MapDraw shape={shape} onChange={onChange} isEditing="polygon">
          <MapDraw.Control polygon />
        </MapDraw>
      </MapContainer>
    </Main>
  );
};

export default observer(AreaDraw);
