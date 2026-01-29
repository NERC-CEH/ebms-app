import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { Page, Header } from '@flumens';
import { Lamp, mothTrapLampsAttr } from 'models/location';
import useLocation from '../useLocation';
import Main from './Main';

const MothTrapSetup = () => {
  const { location } = useLocation();
  if (!location) throw new Error('No location was found');

  const match: any = useRouteMatch();

  const byId = (lamp: Lamp) => lamp.cid === match.params.lampId;
  const lamp = location.data[mothTrapLampsAttr.id].find(byId) as Lamp;

  return (
    <Page id="moth-trap-setup-lamp">
      <Header title="Lamp Details" />
      <Main lamp={lamp} />
    </Page>
  );
};

export default observer(MothTrapSetup);
