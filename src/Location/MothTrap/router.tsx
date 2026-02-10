import { useEffect, useContext } from 'react';
import { Route } from 'react-router';
import { NavContext } from '@ionic/react';
import locations from 'models/collections/locations';
import Location, { LocationType } from 'models/location';
import ModelLocationMap from 'Survey/common/ModelLocationMap';
import MothTrap from './Home';
import MothTrapLamp from './Lamp';

function AddNewMothTrap() {
  const { navigate } = useContext(NavContext);

  const pickDraftOrCreateNewWrap = () => {
    const pickDraftOrCreateNew = async () => {
      const model = new Location({
        data: {
          locationTypeId: LocationType.MothTrap,
          centroidSrefSystem: '4326',
        } as any,
      });
      model.startGPS();

      await model.save();
      locations.push(model);

      const url = `/location/moth-trap/${model.cid}`;
      navigate(url, 'none', 'replace');
    };

    pickDraftOrCreateNew();
  };

  useEffect(pickDraftOrCreateNewWrap, []);

  return null;
}

const routes = [
  ['/location/moth-trap', AddNewMothTrap, true],
  ['/location/moth-trap/:locId', MothTrap],
  ['/location/moth-trap/:locId/location', ModelLocationMap],
  ['/location/moth-trap/:locId/lamps/:lampId', MothTrapLamp],
].map(([route, component]: any) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
