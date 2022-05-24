import { FC } from 'react';
import { Main, MenuAttrItem, CounterInput } from '@flumens';
import { bulbOutline, chatboxOutline } from 'ionicons/icons';
import { IonList, IonItemDivider } from '@ionic/react';
import { observer } from 'mobx-react';
import numberIcon from 'common/images/number.svg';
import Location, { Lamp } from 'models/location';

type Props = {
  location: Location;
  lamp: Lamp;
};

const MothTrapSetupMain: FC<Props> = ({ location, lamp }) => {
  const { description, type } = lamp.attrs;

  const getCounterOnChange = (value: number) => {
    // eslint-disable-next-line no-param-reassign
    lamp.attrs.quantity = value;
  };

  return (
    <Main>
      <IonList lines="full">
        <IonItemDivider>Lamp details</IonItemDivider>

        <div className="rounded">
          <MenuAttrItem
            routerLink={`/location/${location.cid}/lamps/${lamp.cid}/type`}
            routerOptions={{ unmount: true }}
            icon={bulbOutline}
            label="Type"
            value={type}
          />

          <MenuAttrItem
            routerLink={`/location/${location.cid}/lamps/${lamp.cid}/description`}
            routerOptions={{ unmount: true }}
            icon={chatboxOutline}
            label="Description"
            value={description}
          />

          <CounterInput
            label="Quantity"
            onChange={getCounterOnChange}
            value={lamp.attrs.quantity}
            icon={numberIcon}
            min={1}
          />
        </div>
      </IonList>
    </Main>
  );
};

export default observer(MothTrapSetupMain);
