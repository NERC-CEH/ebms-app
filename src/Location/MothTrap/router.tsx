import { useEffect, useContext } from 'react';
import { useRouteMatch } from 'react-router';
import { RouteWithModels, AttrPage } from '@flumens';
import { NavContext } from '@ionic/react';
import locations from 'models/collections/locations';
import MothTrap, { MOTH_TRAP_TYPE } from 'models/location';
import ModelLocationMap from 'Survey/common/ModelLocationMap';
import MothTrapNew from './Home';
import MothTrapLamp from './Lamp';
import LampAttr from './LampAttr';

function AddNewMothTrap() {
  const { navigate } = useContext(NavContext);

  const pickDraftOrCreateNewWrap = () => {
    // eslint-disable-next-line
    const pickDraftOrCreateNew = async () => {
      const model = new MothTrap({
        attrs: {
          locationTypeId: MOTH_TRAP_TYPE,
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

type Props = {
  sample: any;
};

const AttrPageFromRoute = ({ sample: location }: Props) => {
  const match = useRouteMatch<any>();

  const { attr } = match.params;

  const surveyConfig = location.getSchema();

  const { pageProps } = surveyConfig[attr];

  const { headerProps, attrProps } = pageProps;

  if (!attrProps) {
    console.error(`No such config attribute ${attr}`);
    return null;
  }
  return (
    <AttrPage
      model={location}
      attr={attr}
      attrProps={attrProps}
      headerProps={headerProps}
    />
  );
};

const routes = [
  ['/location', AddNewMothTrap, true],
  [`/location/:smpId`, MothTrapNew],
  [`/location/:smpId/:attr`, AttrPageFromRoute],
  [`/location/:smpId/location`, ModelLocationMap],
  [`/location/:smpId/lamps/:lampId`, MothTrapLamp],
  [`/location/:smpId/lamps/:lampId/:attr`, LampAttr],
];

export default RouteWithModels.fromArray(locations as any, routes, false);
