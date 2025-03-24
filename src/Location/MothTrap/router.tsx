import { useEffect, useContext } from 'react';
import { Route } from 'react-router';
import { NavContext } from '@ionic/react';
import locations from 'models/collections/locations';
import MothTrap, { LocationType } from 'models/location';
import ModelLocationMap from 'Survey/common/ModelLocationMap';
import MothTrapNew from './Home';
import MothTrapLamp from './Lamp';

function AddNewMothTrap() {
  const { navigate } = useContext(NavContext);

  const pickDraftOrCreateNewWrap = () => {
    // eslint-disable-next-line
    const pickDraftOrCreateNew = async () => {
      const model = new MothTrap({
        data: {
          locationTypeId: LocationType.MothTrap,
          centroidSrefSystem: '4326',
        } as any,
      });
      model.startGPS();

      await model.save();
      locations.push(model);

      const url = `/location/${model.cid}`;
      navigate(url, 'none', 'replace');
    };

    pickDraftOrCreateNew();
  };

  useEffect(pickDraftOrCreateNewWrap, []);

  return null;
}

const routes = [
  ['/location', AddNewMothTrap, true],
  [`/location/:locId`, MothTrapNew],
  [`/location/:locId/location`, ModelLocationMap],
  [`/location/:locId/lamps/:lampId`, MothTrapLamp],
].map(([route, component]: any) => (
  <Route key={route} path={route} component={component} exact />
));

export default routes;
