import React, { FC, useContext, useState } from 'react';
import { observer } from 'mobx-react';
import { NavContext } from '@ionic/react';
import Sample from 'models/sample';
import { MothTrap } from 'common/types';
import BottomSheet from '../BottomSheet';
import Map from './Components/Map';
import 'leaflet.markercluster';
import './styles.scss';
import 'leaflet/dist/leaflet.css';

interface Props {
  sample: typeof Sample;
  userModel: any;
  isFetchingTraps: boolean | null;
  isDisabled?: boolean;
}

const MapComponent: FC<Props> = ({
  sample,
  userModel,
  isFetchingTraps,
  isDisabled,
}) => {
  const { mothTraps } = userModel.attrs;
  const { goBack } = useContext(NavContext);

  // dynamic center when the user moves the map manually
  const [currentMapCenter, setMapCurrentCenter]: any = useState([51, -1]);

  const onLocationSelect = (point: MothTrap) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.location = point;
    sample.save();

    goBack();
  };

  return (
    <>
      <Map
        sample={sample}
        isFetchingTraps={isFetchingTraps}
        userModel={userModel}
        onLocationSelect={onLocationSelect}
        onMovedCoords={setMapCurrentCenter}
        isDisabled={isDisabled}
      />

      {!isDisabled && (
        <BottomSheet
          pointData={mothTraps}
          centroid={currentMapCenter}
          updateRecord={onLocationSelect}
          sample={sample}
        />
      )}
    </>
  );
};

export default observer(MapComponent);
