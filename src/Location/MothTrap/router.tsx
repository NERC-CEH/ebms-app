import { FC, useEffect, useContext } from 'react';
import { RouteWithModels, AttrPage, ModelLocationMap } from '@flumens';
import { observer } from 'mobx-react';
import MothTrap from 'models/location';
import locations from 'models/collections/locations';
import { useRouteMatch } from 'react-router';
import { NavContext } from '@ionic/react';
import config from 'common/config';
import MothTrapNew from './Home';
import MothTrapLamp from './Lamp';
import LampAttr from './LampAttr';

const ModelLocationWithProps = ({ sample: location }: any) => (
  <ModelLocationMap
    model={location}
    mapProviderOptions={config.map}
    useGridMap
    onLocationNameChange={ModelLocationMap.utils.onLocationNameChange}
    namePlaceholder="Moth trap name"
    onGPSClick={ModelLocationMap.utils.onGPSClick}
  />
);
const ModelLocationWrap = observer(ModelLocationWithProps);

function AddNewMothTrap() {
  const { navigate } = useContext(NavContext);

  const pickDraftOrCreateNewWrap = () => {
    // eslint-disable-next-line
    const pickDraftOrCreateNew = async () => {
      const model = new MothTrap({});
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
  model: any;
};

const AttrPageFromRoute: FC<Props> = ({ sample: location }: any) => {
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
  [`/location/:smpId/location`, ModelLocationWrap],
  [`/location/:smpId/lamps/:lampId`, MothTrapLamp],
  [`/location/:smpId/lamps/:lampId/:attr`, LampAttr],
];

export default RouteWithModels.fromArray(locations, routes);
