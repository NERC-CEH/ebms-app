import { FC } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { AttrPage } from '@flumens';
import Location from 'models/location';

interface Props {
  sample: Location;
}

const LampEntry: FC<Props> = ({ sample: location }) => {
  const match = useRouteMatch<{
    attr: 'type' | 'description';
    lampId: string;
  }>();

  const { attr, lampId } = match.params;

  const byId = (lamp: any) => lamp.cid === lampId;

  const lamp = location.attrs.lamps.find(byId);

  const config: any = Location.lampSchema;

  let attrProps = config[attr];

  if (!attrProps || !lamp) {
    return null;
  }

  attrProps = {
    ...attrProps,
    set(val: string) {
      lamp.attrs[attr] = val;
    },
    get() {
      return lamp.attrs[attr];
    },
  };

  return <AttrPage model={location} attr={attr} attrProps={attrProps} />;
};

export default observer(LampEntry);
