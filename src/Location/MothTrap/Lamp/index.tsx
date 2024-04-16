/* eslint-disable no-param-reassign */

/* eslint-disable camelcase */
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header } from '@flumens';
import Location, { Lamp } from 'models/location';
import Main from './Main';

interface Props {
  sample: Location;
}

const MothTrapSetup = ({ sample: location }: Props) => {
  const match: any = useRouteMatch();

  const byId = (lamp: Lamp) => lamp.cid === match.params.lampId;
  const lamp = location.attrs.lamps.find(byId) as Lamp;

  return (
    <Page id="moth-trap-setup-lamp">
      <Header title="Lamp Details" />
      <Main location={location} lamp={lamp} />
    </Page>
  );
};

export default observer(MothTrapSetup);
