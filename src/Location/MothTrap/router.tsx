import React, { FC, useEffect, useContext } from 'react';
import { RouteWithModels, AttrPage, ModelLocation } from '@apps';
import { observer } from 'mobx-react';
import MothTrap from 'models/location';
import locations from 'models/collections/locations';
import { useRouteMatch } from 'react-router';
import { NavContext } from '@ionic/react';
import config from 'common/config/config';
import MothTrapNew from './Home';
import MothTrapLamp from './Lamp';
import LampAttr from './LampAttr';

const ModelLocationWithProps = ({ sample: location }: any) => (
  <ModelLocation
    model={location}
    mapProviderOptions={config.map}
    useGridMap
    onLocationNameChange={ModelLocation.utils.onLocationNameChange}
    namePlaceholder="Moth trap name"
  />
);
const ModelLocationWrap = observer(ModelLocationWithProps);

function AddNewMothTrap() {
  const { navigate } = useContext(NavContext);

  const pickDraftOrCreateNewWrap = () => {
    // eslint-disable-next-line
    const pickDraftOrCreateNew = async () => {
      const model = new MothTrap({});

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

  const attrProps = surveyConfig[attr];
  if (!attrProps) {
    console.error(`No such config attribute ${attr}`);
    return null;
  }

  return <AttrPage model={location} attr={attr} attrProps={attrProps} />;
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
